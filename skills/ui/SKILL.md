---
name: pixi-vn-ui
description: Use when building game UI (menus, HUD, dialogue box, settings/save screens) on top of Pixi'VN with an external JS framework (React, Vue) or with plain PixiJS components — mounting HTML or PixiJS UI layers over the canvas, navigating between UI screens/routes, theming a shadcn/ui-based template, and connecting UI components to game storage/settings. Covers `canvas.addHtmlLayer`/`getHtmlLayer`/`removeHtmlLayer` and the PixiJS-only layer helpers `canvas.addLayer`/`getLayer`/`removeLayer`.
---

# Pixi'VN User Interface (UI)

Pixi’VN does not ship its own UI components (buttons, menus, forms, HUD). Instead of reinventing
what already exists in the JavaScript ecosystem, it lets a project use any external framework
(React, Vue, ...) — or plain PixiJS — to build the UI, and just provides the plumbing to mount that
UI on top of the canvas and keep it in sync with game data. Official docs:
[pixi-vn.com/start/interface](https://pixi-vn.com/start/interface).

Because the UI is built with standard, widely-used frameworks rather than a proprietary system, AI
coding assistants already know these tools well — this is a deliberate design choice, not just a
missing feature.

## When to use this skill

Load this skill whenever a task involves:

- Building a menu, HUD, dialogue box, settings screen, or save/load screen for a Pixi'VN game.
- Mounting an HTML UI layer (React/Vue root) or a PixiJS UI layer on top of the canvas.
- Navigating/switching between UI screens (routing).
- Reading or writing game storage/settings from UI components, or keeping the UI in sync with
  changes made elsewhere (a label, a step, loading a save).
- Theming/styling a template's generated UI (colors, radius, fonts).

For the rendering primitives the UI sits on top of (images, sprites, text, transitions), see
`pixi-vn-canvas`. For building UI screens purely out of PixiJS components (no HTML framework), see
**`pixijs.md`** in this same skill folder.

## UI vs canvas

The UI and the canvas are two distinct, independent systems:

- **The canvas is save-able; the UI is not.** All canvas element state (by alias) is included in a
  save and restored when loading one — see `pixi-vn-storage`/`pixi-vn-saves`. The UI's current state
  is never included; you must persist whatever UI state matters yourself, into
  [game storage](https://pixi-vn.com/start/storage) or browser storage (see "Connecting UI to game
  data" below).
- **The canvas is stepped; the UI is navigated.** In the canvas you add/replace components during
  each narration step. The UI instead is built as several distinct "screens", and you move between
  them with a router (see "Navigating between UI screens" below) — you don't swap UI content per
  step the way you swap canvas elements.
- **The canvas is Pixi'VN-only; the UI is anything.** The canvas only accepts Pixi'VN's own
  save-able component classes (`Container`, `Sprite`, `ImageSprite`, `Text`, ...). The UI layer can
  hold any HTML/PixiJS component or any UI component library, so it's where the actual interface
  complexity (forms, animations, component libraries) belongs.

## HTML UI layers

An HTML UI Layer is a `<div>` added above the PixiJS canvas, sized and positioned to match it —
this is how a React/Vue (or any DOM-based) UI gets mounted on top of the game.

```ts title="main.ts"
const root = document.getElementById("root");
if (!root) {
  throw new Error("root element not found");
}
const htmlLayer = canvas.addHtmlLayer("ui", root, {
  position: "absolute",
  pointerEvents: "none",
  userSelect: "none",
});
// createRoot(htmlLayer).render(<App />)
```

```html title="index.html"
<!doctype html>
<html lang="en">
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- **`canvas.addHtmlLayer(id, element, style?)`** creates the layer and returns the `HTMLDivElement`
  to render into. `style` is `Partial<Pick<CSSStyleDeclaration, "position" | "pointerEvents" |
"userSelect">>`, defaulting to `{ position: "absolute", pointerEvents: "none", userSelect: "none"
}`.
- **`canvas.getHtmlLayer(id)`** returns the layer's `HTMLElement | undefined`.
- **`canvas.removeHtmlLayer(id)`** removes it.

**Enabling interaction**: every HTML UI layer defaults to `pointer-events: none`, so by default none
of its elements intercept mouse/touch — the PixiJS canvas gets all events. This matters when you
want an image/video on the canvas to receive clicks/taps unobstructed by an overlay. Set
`pointer-events: auto` explicitly, and only, on the components that must be interactive:

```tsx title="React"
export default function NextButton() {
  return <button style={{ pointerEvents: "auto" }}>Next</button>;
}
```

```css title="Shadcn / Tailwind CSS"
@layer components {
  [data-slot="button"],
  [data-slot="card"],
  [data-slot="toggle"] {
    pointer-events: auto;
  }
}
```

## PixiJS UI layers

You can also build a UI screen directly out of PixiJS components (no HTML framework at all), or mix
PixiJS components into an HTML-based UI. This uses a **PixiJS UI Layer** — a plain PixiJS
`Container` attached directly to the PixiJS stage, outside the save-able `canvas.gameLayer` — via
`canvas.addLayer`/`getLayer`/`removeLayer`. See **`pixijs.md`** in this skill folder for the full
API, the differences from `gameLayer`, combining PixiJS and HTML layers, and recommended component
libraries (PixiUI, PixiLayout).

## Real-world layer conventions (official React template)

The API above is library-level; here's _one_ concrete way it's used in practice, from the official
"TS narration + React" template (what `npm create pixi-vn@latest` scaffolds) at `src/main.tsx` /
`src/constants.ts`. This is **the template's convention, not a library requirement**.

- **Named constants for layer ids**, not string literals: `CANVAS_UI_LAYER_NAME`,
  `HTML_UI_LAYER_NAME`, `HTML_CANVAS_LAYER_NAME`. A separate `CANVAS_MINIGAME_LAYER_NAME` constant
  reserves a layer for future minigame content.
- **A dedicated PixiJS UI layer**, added once at startup and kept apart from game-content elements
  (which live in `canvas.gameLayer` via `canvas.add`): `canvas.addLayer(CANVAS_UI_LAYER_NAME, new
Container())`.
- **`canvas.addHtmlLayer` to mount a UI framework's root as an actual canvas layer** — not merely an
  absolutely-positioned `<div>` floating outside the canvas system:
  ```ts
  const htmlLayout = canvas.addHtmlLayer(HTML_UI_LAYER_NAME, root);
  createRoot(htmlLayout).render(<App />);
  ```
  Done inside `Game.init(...).then(...)`, after canvas setup, before rendering the app.
- **`canvas.extractImage()` for save-file thumbnails** — captures a screenshot of the current canvas
  to embed in a save entry: `const image = await canvas.extractImage();`. (This is a `canvas`/save
  concern, not UI state — see `pixi-vn-canvas`/`pixi-vn-saves`.)

## Navigating between UI screens

Docs: [pixi-vn.com/start/interface-navigate](https://pixi-vn.com/start/interface-navigate). To move
between different UI screens, use a routing system that defines routes/paths for each screen and
handles navigation between them — e.g.
[TanStack Router](https://tanstack.com/router/latest), which official templates use, with
file-based route generation (`createFileRoute`, e.g. a file `about.tsx` under `src/routes` becomes
the `/about` route).

**Wiring `navigate` into narration steps**: extend `StepLabelProps` (typically in `pixi-vn.d.ts`,
already done in every official template) so every step/`Game.onEnd`/`Game.addOnError` receives a
`navigate` function:

```ts title="pixi-vn.d.ts"
declare module "@drincs/pixi-vn" {
  interface StepLabelProps {
    navigate: (route: string) => void;
  }
}
```

```ts title="content/labels/start.label.ts"
export const startLabel = newLabel("start", [
  ({ navigate }) => {
    navigate("/new-route");
  },
]);
```

In _ink_ templates, a custom hashtag command navigates instead: `# navigate /new-route`.

**Blocking the browser's back/forward buttons**: those buttons let the player navigate between
_routes_, not narrative _steps_, which can leave the game in an inconsistent state. The recommended
approach is to intercept `popstate` and call `history.forward()` to cancel it, pushing a new history
state on every route change so a _second_ back-press in quick succession is still allowed through —
see the `useConfirmBackNavigation` hook pattern in the
[official docs](https://pixi-vn.com/start/interface-navigate#block-back-forward) for the full
implementation.

## Styling & theming

Docs: [pixi-vn.com/start/interface-font](https://pixi-vn.com/start/interface-font). Official
templates build the UI with [shadcn/ui](https://ui.shadcn.com/) on Tailwind CSS — the component
source is copied into `src/components/ui/`, not installed as an opaque package. The entire theme
(colors, roundness, fonts) lives in one file, `src/styles.css`.

Rather than hand-editing `styles.css`, generate a theme with a visual tool and apply it:

- **[shadcn/ui theme builder](https://ui.shadcn.com/create)** (official) — pick colors, mode, and
  radius with a live component preview, then copy a generated command:
  ```npm
  npx shadcn@latest add <generated-command>
  ```
- **[tweakcn](https://tweakcn.com/)** (community) — same colors/radius, plus live font/shadow
  editing and ready-made presets; exports plain CSS variables you paste into `styles.css` instead.

Either way, once the theme is applied, run:

```npm
npm run ui:reinit
```

This force-reinstalls every shadcn component already in the project from the shadcn registry using
the updated `styles.css`/`components.json`, so every component stays consistent with the new theme
instead of keeping whatever variables it was originally built with.

## Connecting UI to game data

Docs:
[pixi-vn.com/start/interface-connect-storage](https://pixi-vn.com/start/interface-connect-storage).
Variables shown or edited in the UI fall into three categories, each with its own recommended
pattern (official templates use these throughout `src/lib/stores/` and `src/lib/query/`):

**Settings variables** (text speed, font size, auto-forward delay, ...) are _not_ part of
[game storage](https://pixi-vn.com/start/storage) — they must persist across every playthrough, even
before a save exists — so they live in `localStorage`, mirrored into a
[TanStack Store](https://tanstack.com/store/latest) so components re-render on change:

```ts title="src/lib/stores/auto-settings-store.ts"
import { Store } from "@tanstack/store";

export namespace AutoSettings {
  export const store = new Store({
    enabled: Boolean(localStorage.getItem("auto_forward_enabled") ?? false),
    time: Number(localStorage.getItem("auto_forward_second") ?? 1),
  });

  export function setEnabled(value: boolean) {
    localStorage.setItem("auto_forward_enabled", value.toString());
    store.setState((state) => ({ ...state, enabled: value }));
  }
}
```

**Read-only game variables** (a stat, a flag, dialogue text) — read them straight from
[game storage](https://pixi-vn.com/start/storage) inside a
[TanStack Query](https://tanstack.com/query/latest) `queryFn`:

```ts
import { useQuery } from "@tanstack/react-query";
import { storage } from "@drincs/pixi-vn";

export function useQueryAffection() {
  return useQuery({
    queryKey: ["affection_use_query_key"],
    queryFn: async () => storage.get<number>("affection") ?? 0,
  });
}
```

Game storage only changes during a step/go-back, a label call/jump, or loading a save — Pixi'VN has
no way of knowing a query depends on that data, so invalidate broadly at those call sites rather
than tracking every key:

```ts
narration.continue({}).then(() => {
  queryClient.invalidateQueries();
});
```

**Read/write game variables** (a selected option, a toggle tied to a quest flag) — the same Store
pattern as settings, but backed by [game storage](https://pixi-vn.com/start/storage) instead of
`localStorage`, so the value survives saves and `go back`:

```ts
import { storage } from "@drincs/pixi-vn";
import { Store } from "@tanstack/store";

export namespace Memo {
  export const store = new Store<{ selectedQuestId: string | undefined }>({
    selectedQuestId: storage.get<string>("selectedQuestId"),
  });

  export function setSelectedQuestId(id: string | undefined) {
    storage.set("selectedQuestId", id);
    store.setState((state) => ({ ...state, selectedQuestId: id }));
  }
}
```

Because the setter updates the Store directly, the UI stays in sync automatically — but **only** for
changes made through this same setter.

**Keeping the UI in sync with storage changes made elsewhere**: if a label/step/anything else
changes the same game storage variable directly, nothing tells that Store — or a `useQuery` reading
that key — to refresh. Use
[`storage.setStorageHandler`](https://pixi-vn.com/jsdoc/pixi-vn/index/interfaces/StorageManagerInterface#setstoragehandler)
to catch **every** game storage write in one place:

```ts
import { storage } from "@drincs/pixi-vn";

storage.setStorageHandler({
  onSetVariable: (key, value) => queryClient.invalidateQueries(),
  onRemoveVariable: (key) => queryClient.invalidateQueries(),
  onClearOldTempVariable: (key) => queryClient.invalidateQueries(),
});
```

## Gotchas

- **`setStorageHandler` does not stack — it replaces.** It holds a single handler internally; every
  call overwrites the previous one silently. Set it **once**, in one place close to app start-up
  (e.g. the root provider), with a single handler that does everything the UI needs (invalidate
  queries, update stores, etc.) rather than sprinkling several targeted calls across files.
- **HTML UI layers default to `pointer-events: none`.** Forgetting to set `pointer-events: auto` on
  an interactive component is the most common reason a button/input silently doesn't respond.
- **UI state is never saved automatically.** If a UI-only value (a selected menu tab, a toggle not
  tied to game storage) needs to survive a reload, you must persist it yourself — game storage if it
  should survive save/load and `go back`, `localStorage` if it should survive across playthroughs.
- **The browser back/forward buttons can desync the UI route from the narration state** — see
  "Navigating between UI screens" above; most templates block them outright.
- **`CANVAS_APP_GAME_LAYER_ALIAS` (`"__game_layer__"`) is reserved** — `canvas.addLayer` (like
  `canvas.add`/`remove`) refuses that alias for a PixiJS UI layer.

## Related skills

- pixi-vn-canvas: the rendering primitives (images, sprites, text, transitions) the UI sits on top
  of, and the `gameLayer`/alias system the UI deliberately does _not_ use.
- pixi-vn-getting-started: `Game.init()`, `StepLabelProps` augmentation, and how the official
  template wires layers/routing/i18n together at startup.
- pixi-vn-storage: reading/writing the game storage variables the UI reads and writes.
- pixi-vn-saves: what does and does not get included when exporting/restoring game state.
- pixi-vn-narration: labels/steps — what triggers storage changes the UI needs to react to.
