---
name: pixi-vn-getting-started
description: Use when setting up a new or existing project on @drincs/pixi-vn, wiring the main.ts entry point, or calling the top-level Game API (Game.init, Game.start, Game.onEnd, Game.addOnError, Game.onNavigate, Game.clear) — this is the entry point every Pixi'VN project needs before touching canvas, narration, sound, storage, or history.
---

# Pixi'VN project initialization and the Game API

Official docs: [pixi-vn.com/start](https://pixi-vn.com/start). For a full machine-readable index of every Pixi'VN doc page — useful whenever a task needs more detail than this skill set covers — see [pixi-vn.com/llms.txt](https://pixi-vn.com/llms.txt).

## When to use this skill

Use this skill whenever you are bootstrapping a Pixi'VN project from scratch, wiring up `src/main.ts`, or need to understand what `Game.init`/`Game.start` actually do before wiring narration, canvas, sound, storage, or history features. Every other Pixi'VN skill assumes `Game.init` has already run.

## Installing the library

Two paths, depending on whether a project already exists:

- **New project** — scaffold from an official template (recommended for anything from scratch):

  ```bash
  npm create pixi-vn@latest
  ```

  This generates a working project (index.html, entry point, bundler config) already wired to call `Game.init`, with pre-built menu/narration screens, VS Code launch configs, and (since template v2.0.0) TanStack Router for navigation. See [pixi-vn.com/start/templates](https://pixi-vn.com/start/templates) for the full generated project structure, available templates/demos, and how to run/customize one.

  The wizard asks for a narrative language and **defaults/suggests _Ink + TypeScript_** (it's listed first and pre-selected in the prompt for the Visual Novel, Text-based Story, and Point & Click Adventure project types) — plain **TypeScript** narration (what every skill in this set documents) is the other option, selectable in the same prompt. Ink support is a separate narrative language with its own syntax and its own future skill; nothing in this skill set requires it.

  The wizard's first question is the project/game type; the docs have a dedicated getting-started walkthrough for some of them — [pixi-vn.com/start/make-visual-novel](https://pixi-vn.com/start/make-visual-novel) for "Visual Novel", [pixi-vn.com/nqtr/make-point-and-click](https://pixi-vn.com/nqtr/make-point-and-click) for "Point & Click Adventure" — worth pointing a developer to the matching one for their project type, in addition to the general [pixi-vn.com/start/templates](https://pixi-vn.com/start/templates) page above.

- **Existing JS/TS project** — add the package directly:

  ```bash
  npm install @drincs/pixi-vn
  ```

### Required peer dependencies

`@drincs/pixi-vn` does not bundle its own PixiJS/audio/animation stack — it declares compatible versions as peer dependencies (per `package.json`):

| Package          | Required version                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `pixi.js`        | `>=8.17.0`                                                                                                        |
| `tone`           | `>=15.1.0` (audio engine used by the sound module)                                                                |
| `motion`         | `>=12.38.0` (used internally for canvas animations, e.g. `Game.GameUnifier.animate`)                              |
| `@pixi/devtools` | `>=2.0.0` (enables the PixiJS Devtools browser extension integration)                                             |
| `vite`           | `>=5.0.0` — **optional** peer dependency (only needed if you use Vite as your bundler; the official templates do) |

With npm 7+, `npm install @drincs/pixi-vn` auto-installs these peer dependencies too — no separate install step is needed in the common case. If a developer is on an older npm, or uses a package manager that doesn't auto-install peers (e.g. pnpm, or yarn in strict mode), they'll need to install them explicitly (`npm install pixi.js tone motion @pixi/devtools`). If a developer reports errors about missing modules like `pixi.js`, `tone`, or `motion`, check their package manager/version and whether these ended up installed before looking elsewhere.

### Import paths: `@drincs/pixi-vn` vs subpaths

Every module (canvas, characters, history, narration, sound, storage, ...) is available both from the package root and from its own subpath, e.g. `Game`/`canvas`/`sound` all from `@drincs/pixi-vn`, or `canvas` alone from `@drincs/pixi-vn/canvas`. **Default to importing from the root `@drincs/pixi-vn`** — that's what every official doc example and template does:

```ts
import { canvas, Game, narration, sound, storage } from "@drincs/pixi-vn";
```

Reach for a narrower subpath (`@drincs/pixi-vn/canvas`, `/sound`, `/characters`, `/storage`, `/narration`, `/core`, `/pixi.js`, `/motion`) only when there's a concrete reason to avoid pulling in the whole package surface — e.g. a headless/server-side environment where canvas or sound isn't available or permitted, a size-constrained bundle target, or code that genuinely only ever touches one module. This applies to every skill in this set; it isn't repeated per-module.

## Initializing the game: `Game.init`

`Game.init` must be called before any other Pixi'VN function (narration, canvas, sound, storage, history). It has two forms:

1. **Full initialization** — sets up the internal `GameUnifier` state manager _and_ creates the PixiJS `Application` plus the canvas' interface `<div>`, attached to an HTML element:

   ```ts
   export async function init(
     element: HTMLElement,
     options: Partial<ApplicationOptions> & {
       id?: string; // default: "pixi-vn-canvas"
       navigate?: (path: string) => void | Promise<void>;
       resizeMode?: "contain" | "none"; // default: "contain"
     },
     devtoolsOptions?: Devtools,
   ): Promise<void>;
   ```

   - `options` is `Partial<ApplicationOptions>` — i.e. every option accepted by a [PixiJS `Application`](https://pixijs.com/8.x/guides/components/application) (`width`, `height`, `backgroundColor`, `antialias`, ...) — plus three Pixi'VN-specific extras:
     - `id`: id of the generated canvas element.
     - `navigate`: the app's router navigation function (can also be set later with `Game.onNavigate`).
     - `resizeMode`: `"contain"` (fit within the parent, keep aspect ratio — default) or `"none"`.
   - `devtoolsOptions` configures the [PixiJS Devtools](https://pixi-vn.com/start/canvas#use-pixijs-devtools-with-pixivn) integration.

2. **Headless initialization** — `Game.init()` with no arguments. This initializes only the internal `GameUnifier` (storage, narration, history bookkeeping) without creating a PixiJS `Application` or canvas. Useful if you only need save/load, storage, or narration logic without rendering. If you call the 3-argument form but omit `element`/`options`, `Game.init` logs a warning and skips canvas setup the same way.

### Complete example

The official docs' inline example calls `.then()` and wires `Game.onNavigate` as a separate statement (see [pixi-vn.com/start](https://pixi-vn.com/start)); both that style and `await` are valid, and the `navigate` option can be passed inline instead of via a separate `Game.onNavigate` call. Here is the shape matching the current signature in `src/index.ts`:

```ts
// src/main.ts
import { Game } from "@drincs/pixi-vn";

const body = document.body;
if (!body) {
  throw new Error("body element not found");
}

await Game.init(body, {
  width: 1920,
  height: 1080,
  backgroundColor: "#303030",
  resizeMode: "contain",
  navigate: (path) => {
    // e.g. window.history.pushState({}, "", path)
  },
});

Game.onEnd(async (props) => {
  Game.clear();
  props.navigate("/end");
});

Game.addOnError((error, props) => {
  console.error("Error occurred", error);
});

await Game.start("start", {});
```

`Game.start` internally calls `Game.clear()` first, so there is no need to call `Game.clear()` before it yourself.

`props.navigate` above is not a built-in Pixi'VN prop — it exists only because the project augmented `StepLabelProps` via declaration merging (typically in a `pixi-vn.d.ts` file, as every official template does). The same `StepLabelProps` type is used for the props passed to `Game.onEnd`, `Game.addOnError`, and every narration step, so whatever you add there (a `navigate` function, or any other custom prop) becomes available in all of them:

```ts title="pixi-vn.d.ts"
declare module "@drincs/pixi-vn" {
  interface StepLabelProps {
    navigate: (route: string) => void;
  }
}
```

See also: [pixi-vn.com/start/interface-navigate](https://pixi-vn.com/start/interface-navigate) for the full navigation pattern (including the `# navigate` ink hashtag command and blocking the browser back/forward buttons). For the full set of fields the official React template actually adds this way (router `navigate`, i18n, `toast`, interface invalidation), see "Real-world project layout" below.

## The `Game.*` functions

- **`Game.init(element?, options?, devtoolsOptions?)`** — must be called first; see above. Returns a `Promise<void>`.

- **`Game.start<T>(label, props)`** — clears all game data (`Game.clear()`) and begins narration from the given label (a `LabelIdType` string, or a `LabelAbstract` instance). Throws if the label isn't found.

  ```ts
  await Game.start("start", {});
  ```

- **`Game.clear()`** — resets everything: storage, canvas (if initialized), sound, narration, and history. Used to reset the game (e.g. returning to the main menu).

- **`Game.onEnd(value: StepLabelType)`** — registers the function run when all `steps` of all `labels` have been executed (no more steps/labels to continue into). Set it once during initialization. The docs note three common ending strategies: the game simply ends here; the game has no real end and this handler restarts/loops back into a label; or the game ends earlier at a specific point (e.g. game over) without ever relying on this handler.

  ```ts
  // end the game and navigate to an end screen
  Game.onEnd(async (props) => {
    props.navigate("/end");
  });
  ```

  ```ts
  // no real end: loop back into the start label instead
  Game.onEnd(async (props) => {
    narration.call(startLabel, props);
  });
  ```

  See also: [pixi-vn.com/start/other-narrative-features#managing-the-end-of-the-game](https://pixi-vn.com/start/other-narrative-features#managing-the-end-of-the-game).

- **`Game.addOnError(handler: OnErrorHandler)`** — registers an error handler; multiple handlers can be added and run in registration order (sync or async). Returns a function that removes the handler. Check `error instanceof PixiError` (from `@drincs/pixi-vn/core`) to special-case Pixi'VN's own errors (e.g. missing assets). A companion helper, `drawCanvasErrorHandler()` (from `@drincs/pixi-vn/canvas`), returns a ready-made handler that draws a red placeholder box on the canvas when a `PixiError` carries canvas element info — useful during development to visualize broken canvas elements instead of silently failing.

  ```ts
  Game.addOnError((error, props) => {
    if (error instanceof PixiError) {
      // Pixi'VN-specific error (has error.code, maybe error.canvasElementInfo)
    }
    // any extra field on `props` (e.g. a `toast` helper for showing an error
    // notification) is only available if you added it to `StepLabelProps`
    // yourself — see the `navigate` example above, and the fuller
    // `toast`/`invalidateInterfaceData` example later in this skill.
  });
  ```

  `Game.removeOnError(handler)` unregisters a previously added handler.

- **`Game.onNavigate(value: (path: string) => void | Promise<void>)`** — registers (or replaces) the app's routing function, used whenever Pixi'VN needs to navigate (e.g. on `Game.onEnd`, or restoring a save). Equivalent to passing `navigate` inline to `Game.init`.

  ```ts
  Game.onNavigate((path) => router.push(path));
  ```

- **`Game.exportGameState()` / `Game.restoreGameState(data)` / `Game.jsonToGameState(json)`** — the save/load trio. Full detail, including the official template's save-slot/quick-save/IndexedDB convention, is covered by `pixi-vn-saves`.

- **Narration lifecycle hooks** — `Game.onStepStart`, `Game.onStepEnd`, `Game.onLoadingLabel` (fires on step 0 and on save-load — the hook a label uses to load/background-load its own asset bundle, see `pixi-vn-assets`), `Game.onLabelStarting`, and `Game.onLabelClosing` let you intercept/defer label transitions (e.g. to run a UI transition before the next label actually starts). These are advanced hooks — most projects only need `onEnd`.

- **`Game.addOnPreContinue(handler)` / `Game.removeOnPreContinue(handler)`** — register handlers that run immediately before every narration "continue" step (e.g. auto-save on each step).

## Project structure

A typical Pixi'VN project (as generated by `npm create pixi-vn@latest`, or as set up manually):

```
index.html          # loads /src/main.ts as an ES module
src/main.ts          # calls Game.init(), Game.onEnd(), Game.addOnError(), Game.onNavigate(), Game.start()
styles.css           # full-viewport, no scroll/margin, dark background behind the canvas
```

The canonical minimal `index.html` mounts a root `<div id="root">` that becomes (or contains) the element passed to `Game.init`, and loads the entry point as an ES module:

```html title="index.html"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Game</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Paired with a `styles.css` that makes the canvas fill the viewport with no scrollbars or margin:

```css title="styles.css"
html,
body {
  background-color: #242424;
  height: 100%;
}

body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  overflow: hidden;
}
```

Real templates generated by `npm create pixi-vn@latest` are richer than this minimal sketch: narrative content lives under `ink/` (`.ink` scripts) and `src/content/` (`labels/*.label.ts`, `characters.ts`), UI screens under `src/components/`/`src/routes/` (TanStack Router), and `src/pixi-vn.d.ts` is exactly where the `StepLabelProps` augmentation shown above lives. Full breakdown: [pixi-vn.com/start/templates#project-structure](https://pixi-vn.com/start/templates#project-structure).

Note also that Pixi'VN deliberately has no built-in UI components — buttons, menus, and HUD are built with a regular JS framework (React/Vue/PixiJS) layered over the canvas via `canvas.htmlLayers.add`/`canvas.layers.add`. Canvas state is included in saves; UI state is not, so persist any UI-only state yourself. See [pixi-vn.com/start/interface](https://pixi-vn.com/start/interface).

A few constants worth knowing about (exported from `@drincs/pixi-vn`, defined in `src/constants.ts`): `PIXIVN_VERSION` (the installed library version, embedded in `GameState.pixivn_version` for save-file compatibility checks) and `CANVAS_APP_GAME_LAYER_ALIAS` (the alias of the root canvas layer). `SYSTEM_RESERVED_STORAGE_KEYS` lists storage keys Pixi'VN reserves internally (dialogue, choices, input, characters, etc.) — avoid reusing these names for custom storage variables.

## The Vite plugin: `@drincs/pixi-vn/vite`

**Every official template wires up `vitePluginPixivn` in `vite.config.ts` — for any Vite-based project, this plugin is the backbone that makes content (characters/labels) and asset manifests available consistently in dev and build, and it is what generates the string-literal ID types (`CharacterIdType`, `LabelIdType`, ...) used everywhere else in this skill set.** Reach for it whenever a developer's `narration.call("someLabel")` isn't getting autocomplete/type-checking on the label id, or asks how characters/labels "just work" without a manual import list.

```ts
// vite.config.ts
import { vitePluginPixivn } from "@drincs/pixi-vn/vite";

export default defineConfig({
  plugins: [
    vitePluginPixivn({
      content: "./src/content/index.ts",
      characters: "./src/content/characters.ts",
      labels: "./src/content/labels/*.label.ts",
      typeFilePath: "./src/pixi-vn.keys.gen.ts",
      assetsManifest: async (ssrLoadModule) => {
        const mod = await ssrLoadModule("./src/assets/index.ts");
        return mod.manifest;
      },
    }),
  ],
});
```

What it actually does:

- **Loads content before anything else needs it.** The `content`/`characters`/`labels` glob options are executed server-side (via Vite SSR, in dev *and* during `vite build`) at startup, so `RegisteredCharacters`/`RegisteredLabels` are fully populated before any other plugin (notably an ink compiler) or the app itself runs. Without this, whether your content has actually registered by the time something reads it would depend on unpredictable import ordering.
- **Generates type-safe ID unions.** When `typeFilePath` is set, the plugin (re)writes that file on every startup and every content hot-reload with `declare module` augmentations that narrow `CharacterIdType`, `LabelIdType`, `BundleIdType`, and `AssetAliasIdType` from plain `string` to a union of the actual known literals — so `narration.call("typo_label")` becomes a compile error instead of a runtime one. The same file also exports plain `as const` arrays/enums (`characterIds`, `labelIds`, `bundleIds`, `assetAliasIds`) for runtime validation (e.g. `z.enum(characterIdsEnum)`). This generated file is excluded from HMR, so regenerating it never triggers a full page reload.
- **Bridges the PixiJS assets manifest.** The `assetsManifest` option (a value or an async function, typically resolving to the `manifest` built in `src/assets/index.ts` — see `pixi-vn-assets` for how that file is authored) feeds bundle/asset-alias ids into the same generated file, and seeds a dev-server endpoint (`GET /__pixi-vn/assets/manifest`) so devtools/other tooling can read the current manifest without the client having to push it first.
- **Hot-reloads content correctly.** Editing a watched label/character file clears the relevant registry and reloads just those files, regenerating the keys file — without a full page reload.

Don't hand-configure the underlying `GET/POST /__pixi-vn/*` dev-server endpoints or `api.setExternalLabels`/`api.setAssetsManifest` unless building a *plugin that integrates with* `vitePluginPixivn` (e.g. an ink compiler) — for an app, the four options above (`content`, `characters`, `labels`, `typeFilePath`, `assetsManifest`) are the whole interface that matters.

A related, smaller export, `@drincs/pixi-vn/vite-listener`, provides `setupPixivnViteData()` — a client-side, dev-only function that POSTs the *runtime* assets manifest and current canvas size back to the same dev-server endpoints. Call it once after content is loaded (`await setupPixivnViteData()`) only as a fallback for cases where the manifest truly isn't knowable at `vite.config.ts` time; the official templates prefer the `assetsManifest` function option above and don't need it.

## Real-world project layout (official React template)

Everything below reflects **the official `pixi-vn-react-template`'s convention** (what `npm create pixi-vn@latest` generates for the "TS narration + React" option) — it is one working way to organize a project, not a rule the library enforces. Other official/community templates (ink narration, non-React UI, headless) are free to lay things out differently; only `Game.init` running first is actually required.

### Named constants instead of hardcoded strings

The template defines layer/channel ids as constants in `src/constants.ts` instead of inlining string literals at each call site:

```ts
// src/constants.ts
export const CANVAS_UI_LAYER_NAME = "ui";
export const HTML_UI_LAYER_NAME = "ui";
export const HTML_CANVAS_LAYER_NAME = "canvas";
export const BGM_CHANNEL_NAME = "bgm";
export const SFX_CHANNEL_NAME = "sfx";
```

This keeps the `canvas.layers.add(...)`, `canvas.htmlLayers.add(...)`, and `sound.channels.add(...)` calls below typo-proof and greppable.

### Full `main.tsx` wiring

```tsx
Game.init(body, {
  id: HTML_CANVAS_LAYER_NAME,
  height: 1080,
  width: 1920,
  backgroundColor: "#303030",
  resizeMode: "contain",
}).then(() => {
  // A PixiJS-rendered layer for in-canvas UI elements
  canvas.layers.add(CANVAS_UI_LAYER_NAME, new Container());

  // One background music channel, one default channel for one-off sfx
  sound.channels.add(BGM_CHANNEL_NAME, { background: true });
  sound.channels.add(SFX_CHANNEL_NAME);
  sound.defaultChannelAlias = SFX_CHANNEL_NAME;

  // Mount a UI framework (React here) INSIDE the PixiJS canvas tree
  const root = document.getElementById("root")!;
  const htmlLayout = canvas.htmlLayers.add(HTML_UI_LAYER_NAME, root);
  if (!htmlLayout) throw new Error("htmlLayout not found");
  createRoot(htmlLayout).render(<App />);
});

Game.onEnd(async ({ navigate }) => {
  Game.clear();
  navigate({ to: "/" });
});

Game.addOnError(drawCanvasErrorHandler());
Game.addOnError((error, { toast, uiTransition }) => {
  toast?.error(uiTransition?.("allert_error_occurred"));
  console.error("Error occurred", error);
});

Game.onLoadingLabel((_stepId, { id }) => Assets.backgroundLoadBundle(id));
```

Key points:

- `canvas.layers.add` adds a PixiJS container drawn directly in the canvas render tree; `canvas.htmlLayers.add` instead hands back a DOM node kept in sync with a canvas-tracked layer, and is where any HTML/React/Vue UI gets mounted. This is the concrete mechanism behind "Pixi'VN has no built-in UI, bring your own framework" (see `pixi-vn-ui`).
- Multiple error handlers can be stacked: the library's own `drawCanvasErrorHandler()` (visualizes broken canvas elements) runs alongside a project-specific handler that shows a toast and logs to console.
- `Game.onLoadingLabel` fires as a label is about to run; the template uses it to kick off `Assets.backgroundLoadBundle(id)`, pre-warming an asset bundle named after the label id so images referenced by that label are already cached when needed.

### Auto-importing narrative content: `content/index.ts`

Instead of hand-maintaining an import list for every label/character file (and remembering to update it each time one is added), the template eagerly imports everything under `content/` purely for side effects, using Vite's `import.meta.glob`:

```ts
// src/content/index.ts
void import.meta.glob(["./**/*.ts", "./**/*.tsx", "!./index.ts"], {
  eager: true,
});
```

`main.tsx`/`App.tsx` then does a single `import "@/content"`. This works because defining a `Character` or calling `newLabel(...)` registers it as a side effect of the module executing — the glob guarantees every file under `content/` runs at startup with no per-file import to remember. (Bundlers other than Vite need their own equivalent, e.g. webpack's `require.context`.)

### Augmenting `StepLabelProps` for custom per-step context

`src/pixi-vn.d.ts` is where the template applies the declaration-merging pattern shown earlier in this skill (the `navigate` example) to add its actual project-specific fields to `StepLabelProps`:

```ts
// src/pixi-vn.d.ts
declare module "@drincs/pixi-vn" {
  interface StepLabelProps {
    navigate: UseNavigateResult<string>; // TanStack Router
    t: TFunction<[string], undefined>; // i18next: narration text
    uiTransition: TFunction<[string], undefined>; // i18next: UI chrome text
    toast: typeof toast; // sonner's toast function
    invalidateInterfaceData: (delay?: number) => Promise<void> | void;
  }
}
```

Whatever is added here becomes available on the `props` argument of every narration step, `Game.onEnd`, and `Game.addOnError` alike — a single place to inject router/i18n/toast/anything-else a project's narration layer needs. `t` vs `uiTransition` splits narration-text translations from UI-chrome translations; `invalidateInterfaceData` is a template-specific hook that forces UI data (e.g. a React Query cache) to refetch after a step changes something the interface depends on.

## Related skills

- **pixi-vn-assets** — registering local/online assets, the manifest/bundle/alias system, and when to load them.
- **pixi-vn-canvas** — adding/animating images, sprites, text, video and containers on the PixiJS canvas after `Game.init`.
- **pixi-vn-characters** — defining and registering `Character` instances used in dialogue.
- **pixi-vn-history** — the step history system (`stepHistory`), going back/forward through played steps, and save-checkpoint behavior.
- **pixi-vn-narration** — labels, steps, dialogue, choices, and the `narration` object driving the story.
- **pixi-vn-saves** — `Game.exportGameState`/`restoreGameState` and the official save-slot/quick-save convention.
- **pixi-vn-sound** — playing music and sound effects, channels, and volume control.
- **pixi-vn-storage** — reading/writing persistent and temporary game variables and flags.
- **pixi-vn-ui** — building/mounting UI layers (HTML or PixiJS) on top of the canvas, screen navigation, theming, and connecting UI to storage.
- **pixi-vn-migration** — upgrading an existing project to the current version.
