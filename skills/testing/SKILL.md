---
name: pixi-vn-testing
description: Use when an AI agent (or any external script) needs to play-test a running Pixi'VN game end-to-end in a real browser — starting the game, advancing/branching the story, answering input prompts, going back, and reading/writing storage — via `Game.testing`, the opt-in devtools bridge exposed on `window`. Load this before wiring up automated/agent-driven playtesting, not for authoring story content itself (see `pixi-vn-narration`).
---

# Pixi'VN Testing module

## When to use this skill

Use this skill when the task is to **play the game from the outside** — driving it like a player
would, but from a script or an AI agent evaluating JavaScript in the page, instead of clicking UI. Typical
asks this covers: "start the game and play through label X", "verify choice B leads to ending Y",
"check that this bug repros after going back three steps", "seed storage with `gold: 100` and confirm the
shop unlocks", "run this game headless as a regression test".

This assumes the game's dev server (or a build served on a URL) and a browser are already
running/reachable — starting either one is outside this skill; it only covers the game-control API
itself. Do not use this skill for writing story content (`pixi-vn-narration`), save-file persistence
(`pixi-vn-saves`), or the go-back UI/internals (`pixi-vn-history`) — those are the modules this skill
drives, not what it teaches.

## 1. Why you can't just call `narration.continue({})` from the console

`narration.continue`, `.call`, `.jump`, `narration.choices.select`, and `stepHistory.back` all take a
`props` argument typed as `StepLabelProps` — the exact object a real game passes from its UI layer.
Most real projects augment `StepLabelProps` (via TS module augmentation, see `pixi-vn-getting-started`)
with app-specific fields: a router `navigate`, an i18n `t`, a `toast`, etc. (the official React
template does exactly this — see `pixi-vn-narration` section 9). If a step calls `props.navigate(...)`
or `props.t(...)`, passing `{}` from a console/script call throws immediately.

`Game.testing` solves this once: the app pushes its real, live props to it (via `setProps`, see below)
wherever it already builds them, and every action it exposes merges those in before delegating — so
agent-driven calls behave exactly like a real player action, with no need to reconstruct or fake the
app's props shape.

## 2. Enabling it

`Game.testing` is **opt-in and disabled by default**, and nothing about it depends on any particular
bundler (Vite, Webpack, or none at all). Two independent pieces make it work:

- **Turning the `window` bridge on/off** — `Game.testing.enable(options?)` / `.disable()`.
- **Keeping it supplied with live props** — `Game.testing.setProps(props)`.

### Turning it on/off

If the project uses `@drincs/pixi-vn/vite`'s `vitePluginPixivn`, this is already handled: its
`testing` option **defaults to `true`**, auto-enabling `Game.testing` for as long as `vite dev` keeps
running (by injecting a small module into `index.html`) — **never** during `vite build`, regardless of
the option. No app code needed for this part:

```ts
// vite.config.ts — this is already the default, shown here just to make it explicit
vitePluginPixivn({ testing: true }); // or { testing: { windowKey: "myGameTesting" } }, or false to opt out
```

Pass `testing: false` if you don't want this — e.g. a dev server shared with other people that you
don't want remote-controllable.

Without the Vite plugin (a different bundler, or no bundler-level integration at all), call it
yourself, gated behind your own dev-only check:

```ts
import { Game } from "@drincs/pixi-vn";

if (import.meta.env.DEV) {
    // or process.env.NODE_ENV !== "production", a Webpack DefinePlugin flag, etc.
    Game.testing.enable();
}
```

- `options.windowKey` (default `"pixiVN"`) — the property name the API is attached under on `window`.
- Returns the same API object it attaches to `window[windowKey]`, in case you want to keep a direct
  reference instead of going through `window`.
- Calling `enable` again (e.g. on hot reload) replaces the previous session instead of stacking.
- `Game.testing.disable()` tears it down (detaches from `window`, stops capturing errors).
- `Game.testing.isEnabled()` reports whether a session is currently active.

**Only enable this when you actually want the game remote-controllable.** It hands out full control
over game state (see §4) to anything that can run JavaScript in that page — treat it like any other
devtools/debug backdoor.

### Keeping it supplied with live props: `setProps`

Call `Game.testing.setProps(props)` **unconditionally**, wherever your app already builds its
`StepLabelProps` — it's a cheap assignment, safe to call whether or not testing happens to be enabled
right now, and every `Game.testing` action reads through whatever was passed here most recently:

```ts
import { Game, type StepLabelProps } from "@drincs/pixi-vn";

function useGameProps(): StepLabelProps {
    // ... build props the same way your app always has ...
    const props = { navigate, t, toast /* ... */ };
    Game.testing.setProps(props); // [!code focus]
    return props;
}
```

### React template convention

The official React template's `useGameProps()` (`src/lib/hooks/props-hooks.ts` — see
`pixi-vn-narration` section 9) already ends with exactly that `Game.testing.setProps(props)` call, and
`vite.config.ts`'s `vitePluginPixivn(...)` call needs no extra option — `testing` defaults to `true`.
Since `useGameProps()` already runs on every render of every component that needs game props, this is
the only line the template needs: no dedicated bridge component, no manual `enable()` call.

## 3. Driving the game

Every action below reads through `window.pixiVN` (or your custom `windowKey`), evaluated in the page —
e.g. via a browser automation tool's "evaluate script" capability, or by pasting into the devtools
console by hand. All of them are `async` except `setInput`, `closeCurrentLabel`/`closeAllLabels`, and
`getState`.

```js
// Start the game from a label (id or Label object). Clears all game data first, like a real "New Game".
await window.pixiVN.start("start");

// Advance one step (same guard a "next" button uses — see canContinue in getState() below).
await window.pixiVN.continue();

// Call a sub-label (returns to the caller when it runs out of steps) / jump to another label (no return).
await window.pixiVN.call("some_label");
await window.pixiVN.jump("some_label");

// Pick an open choice by its choiceIndex (see getState().choices below for what's available).
await window.pixiVN.selectChoice(0);

// Answer a pending input prompt, then continue like the player pressing confirm would.
window.pixiVN.setInput("Liam");
await window.pixiVN.continue();

// Go back one (or more) steps.
await window.pixiVN.goBack();
await window.pixiVN.goBack({}, { steps: 3 });

// Close the current label / close every open label (can end the game — see pixi-vn-narration).
window.pixiVN.closeCurrentLabel();
window.pixiVN.closeAllLabels();
```

Every action accepts an optional second `extraProps` argument (first argument for `selectChoice`'s
props is its second argument, `continue`/`goBack`'s is first) that's shallow-merged **on top of** the
live props for that one call — useful to override just one field (e.g. a fake `navigate` to observe
where the game tried to go) without touching the app's real wiring:

```js
await window.pixiVN.continue({ navigate: (to) => console.log("would navigate to", to) });
```

### Reading state before deciding the next action

Don't act blindly — read `getState()` first to see what's actually on screen and what actions are
valid right now:

```js
window.pixiVN.getState();
// {
//   dialogue: { text: "What do you choose?", character: {...} } | undefined,
//   dialogueGlue: false,
//   choices: [{ text: "A", choiceIndex: 0, ... }, { text: "Close", choiceIndex: 1, ... }] | undefined,
//   input: { isRequired: false, type: undefined, value: undefined },
//   canContinue: true,
//   canGoBack: true,
//   labelsOpened: [...],       // narration.labels.opened
//   currentLabelId: "choice_label",
//   stepCounter: 12,
// }
```

- If `choices` is set, call `selectChoice(choiceIndex)` — don't call `continue()`, it won't advance
  past an open choice menu.
- If `input.isRequired` is `true`, call `setInput(value)` before the next `continue()`.
- If `canContinue` is `false` for any other reason, a step is mid-flight (e.g. an async transition) —
  wait and re-check rather than firing another action immediately.

### Driving the app's UI directly, not just narration

`window.pixiVN.props` is the same live object `setProps` was last called with — whatever your
app's `StepLabelProps` augmentation defines. Most projects put a `navigate` function there (see
`pixi-vn-getting-started` and the wiki's "Navigate/switch between UI screens" page) so labels can
switch screens; that same function is reachable here for full control over what's on screen, not just
the story — e.g. opening a settings screen, jumping to a main menu, or checking where a bugged label
tried to send the player, all without going through a choice/label:

```js
window.pixiVN.props.navigate("/settings");
```

Anything else the app's `StepLabelProps` happens to expose (a `toast`, a `t` translator, ...) is
reachable the same way. If your project doesn't augment `StepLabelProps` with a navigation function at
all, this simply isn't available — driving screen navigation is then whatever mechanism the app itself
uses outside of Pixi'VN (e.g. calling the router directly from the evaluated script).

## 4. Full state control

Beyond the guided actions above, the API also exposes the underlying singletons directly, for anything
not covered by a dedicated method — most commonly **storage**, to set up a scenario without replaying
the whole story to reach it, or to assert on state a dialogue doesn't surface:

```js
// Arrange: seed state before starting/continuing.
window.pixiVN.storage.set("gold", 100);
window.pixiVN.storage.flags.set("met_liam", true);

// Assert: read state after driving the story forward.
window.pixiVN.storage.get("gold"); // 100

// Reset between test scenarios.
window.pixiVN.storage.clear();       // back to storage.default
window.pixiVN.Game.clear();          // wipes storage + narration + history + canvas + sound

// Snapshot / restore full game state instead of replaying steps to get back to a scenario.
const snapshot = window.pixiVN.Game.exportGameState();
// ... drive the game further, try something risky ...
await window.pixiVN.Game.restoreGameState(snapshot);
```

`window.pixiVN.narration` and `window.pixiVN.stepHistory` are the same `narration`/`stepHistory`
singletons documented in `pixi-vn-narration` and `pixi-vn-history` — anything those skills document
(`narration.dialogue`, `narration.labels.current`, `stepHistory.narrativeHistory`, ...) is reachable
the same way here, read-only or not.

## 5. Catching errors during an automated run

An automated/agent-driven session can't "notice" a red error toast the way a human tester would.
`Game.testing.enable` registers its own `Game.addOnError` handler for as long as it's active, so
errors raised anywhere in the game (including inside steps) are captured instead of only surfacing in
the UI:

```js
window.pixiVN.errors;
// [{ error: Error("..."), timestamp: 1730000000000 }, ...]

window.pixiVN.clearErrors(); // e.g. between test cases, so failures don't bleed across scenarios
```

This is in addition to, not a replacement for, whatever `Game.addOnError` handlers the app itself
registers (e.g. `drawCanvasErrorHandler()`) — both run.

## Related skills

pixi-vn-getting-started, pixi-vn-narration, pixi-vn-storage, pixi-vn-history, pixi-vn-saves
