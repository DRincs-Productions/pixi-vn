---
name: pixi-vn-migration
description: Use when upgrading an existing @drincs/pixi-vn project to a newer version, or when a runtime/type error matches a known breaking change (e.g. `media.volume` no longer a plain number, `sound.edit`/`sound.add` missing, `Game.onError` signature changed, a ticker preset class not found). Covers every breaking change between versions with before/after code.
---

# Pixi'VN Migration guide

Official docs: [pixi-vn.com/faq/migration](https://pixi-vn.com/faq/migration). That page also covers
the separate `nqtr` and `pixi-vn-ink` packages — this skill only covers the core `@drincs/pixi-vn`
package (the `## pixi-vn` section of that page), since that's what this skill set documents.

## When to use this skill

Use this skill whenever a task is "upgrade this project's `@drincs/pixi-vn` from version X to the
latest", or a developer hits an error that looks like a removed/renamed API. Check the currently
installed version first (`package.json` dependency, or `PIXIVN_VERSION`/`GameState.pixivn_version`
at runtime — see `pixi-vn-getting-started`), then walk forward through only the version sections
below that fall between the installed version and the target — most of these changes don't apply
unless a project is crossing that specific boundary.

## v1.7.x → v1.8.0 — Tone.js audio engine

The audio system moved from `@pixi/sound` to Tone.js (performance, stability, flexibility). Two
consequences (full API in `pixi-vn-sound`):

- A `media`'s `volume` is no longer a plain linear number — it's now a Tone.js decibel `Param`:
  ```ts
  const bgmMedia = sound.find("bgm_cheerful");
  if (bgmMedia) bgmMedia.volume = 90; // [!code --]
  if (bgmMedia) bgmMedia.volume.value = 90; // [!code ++]
  ```
- Editing an already-loaded audio asset directly (`sound.edit(alias, options)`) is no longer
  possible — there is no replacement call; re-load/re-play with new options instead.

## v1.6.x → v1.7.0 — template integration cleanup

- HTML layers (`canvas.addHtmlLayer`) now default to `userSelect: "none"` (prevents accidental text
  selection during UI interaction). Opt back in per layer if needed:
  ```ts
  const htmlLayer = canvas.addHtmlLayer("ui", root, { userSelect: "auto" }); // [!code ++]
  ```
- Navigation is now centralized: use `Game.onNavigate` once instead of passing a navigate function to
  every call site that needs one (see `pixi-vn-getting-started`):
  ```ts
  Game.onNavigate((path) => navigateTo(path)); // [!code ++]

  Game.restoreGameState(data, navigateTo); // [!code --]
  Game.restoreGameState(data); // [!code ++]
  ```
- Custom UI storage reactivity: `storage.setStorageHandler({ onSetVariable, onRemoveVariable,
  onClearOldTempVariable })` lets a UI state store mirror game-storage changes automatically (see
  `pixi-vn-storage`) — new capability, not a breaking change, but worth knowing this version added it.

## v1.5.x → v1.6.0 — sound module rewrite, `Game.start`, storage key convention, `addOnError`

The sound API was completely redesigned around the `sound`/`channels`/`media`/`assets` split (see
`pixi-vn-sound` for the current shape):

```ts
sound.add("bird", "resources/bird.mp3"); // [!code --]
sound.play("bird", { loop: true }); // [!code ++] (sound.play replaces add()+play())

let s = sound.add("bird", { url: "resources/bird.mp3", loop: true }); // [!code --]
s.play(); // [!code --]
s.pause(); // [!code --]
sound.play("bird", { loop: true }); // [!code ++]
sound.pause("bird"); // [!code ++]
```

Other changes this version:

- `Game.start(label, props)` was added as the recommended entry point (see `pixi-vn-getting-started`)
  instead of the previous `Game.clear()` + `narration.call(...)` pair:
  ```ts
  Game.clear(); // [!code --]
  narration.call("start", gameProps); // [!code --]
  Game.start("start", gameProps); // [!code ++]
  ```
- Storage keys adopted a `:`-separated namespacing convention (e.g. `character:alice:friendship`) —
  doesn't break existing saves or the API, just a recommended naming style (see `pixi-vn-storage`).
- Error handling moved to `Game.addOnError` (supports multiple stacked handlers) instead of the
  singular, now-deprecated `Game.onError`, and dropped the `type` argument (see
  `pixi-vn-getting-started`):
  ```ts
  Game.onError((type, error, { notify, uiTransition }) => { ... }); // [!code --]
  Game.addOnError((error, { toast, uiTransition }) => { ... }); // [!code ++]
  ```

## v1.4.x → v1.5.0 — `pixi.js` external, canvas resize CSS

- `pixi.js` is now marked **external** for non-CDN builds (Vite, official templates) — needed
  because `pixi.js` doesn't support multiple bundled instances; only relevant if something in the
  build config assumed it was bundled.
- The canvas resizing logic changed; if upgrading an existing (pre-v1.5.4) template, update the base
  CSS to match the current one (see `pixi-vn-getting-started`'s exact `index.html`/`styles.css`).

## v1.3.x → v1.4.0 — `stepHistory.back()` takes props, not a navigate function

To support synchronous multi-step back/continue requests, `stepHistory.back()`'s argument changed
from a path-navigation callback to the same `StepLabelProps`-shaped object passed to every step —
the actual navigate function now lives on `Game.init()` instead (see `pixi-vn-history` /
`pixi-vn-getting-started`):

```ts
stepHistory.back((_path) => {
  /* navigate in the url path */
}); // [!code --]
const gameProps = {};
stepHistory.back(gameProps); // [!code ++]
```

```ts
Game.init(body, {
  height: 1080,
  width: 1920,
  backgroundColor: "#303030",
  navigate: (_path) => {
    /* navigate in the url path */
  }, // [!code ++]
}).then(() => {
  /* ... */
});
```

Also removed in this release (all long-deprecated): `stepHistory.goBack`, `narration.goNext`,
`PIXI` (the re-exported namespace), `canvas.canvasWidth`/`canvas.canvasHeight`,
`canvas.onEndOfTicker`, the `FadeAlphaTicker`/`MoveTicker`/`RotateTicker`/`ZoomTicker` preset classes,
`narration.canContinue` (now `stepHistory`-side), `narration.callLabel`/`jumpLabel` (now `call`/
`jump`), `narration.choiceMenuOptions`, `storage.startingStorage`/`setVariable`/`getVariable`/
`removeVariable` (now `storage.default`/`set`/`get`/`remove`).

## v1.2.x → v1.3.0 — `canvas.animate` replaces ticker presets

Canvas animation was rebuilt around `canvas.animate` (PixiJS tickers + the `motion` library, see
`pixi-vn-canvas`), deprecating the old ticker-preset classes (`FadeAlphaTicker`, `MoveTicker`,
`RotateTicker`, `ZoomTicker`) in favor of transition helpers (`showWithDissolve`, `moveIn`, ...) and
`canvas.animate` directly.

## v0.10.x → v1.0 — the modular rewrite

The first stable release split the engine into independent modules (canvas/characters/history/
narration/sound/storage), introduced the `Game` namespace as the main entry point, and pulled step
history out into its own `stepHistory` module (previously part of `narration`). Renames, all still
relevant if migrating a pre-1.0 project:

```ts
clearAllGameDatas(); // [!code --]
Game.clear(); // [!code ++]

canvas.initialize(body, options).then(...); // [!code --]
Game.init(body, options).then(...); // [!code ++]

getSaveData(); // [!code --]
Game.exportGameState(); // [!code ++]

getSaveJson(); // [!code --]
JSON.stringify(Game.exportGameState()); // [!code ++]

loadSaveData(data, navigate); // [!code --]
Game.restoreGameState(data, navigate); // [!code ++]

jsonToSaveData(json); // [!code --]
JSON.parse(json); // [!code ++]

narration.canGoBack; // [!code --]
stepHistory.canGoBack; // [!code ++]

narration.back(); // [!code --]
stepHistory.back(); // [!code ++]

narration.narrativeHistory; // [!code --]
stepHistory.narrativeHistory; // [!code ++]
```

See `pixi-vn-getting-started` for the current `Game` API, `pixi-vn-history` for `stepHistory`, and
`pixi-vn-saves` for the current `exportGameState`/`restoreGameState` save/load flow.

## Related skills

- pixi-vn-getting-started — current `Game` API, project setup.
- pixi-vn-saves — current save/load flow (`Game.exportGameState`/`restoreGameState`).
- pixi-vn-history — current `stepHistory` API.
- pixi-vn-sound — current sound/channel/media API.
- pixi-vn-canvas — current transition/animation API.
- pixi-vn-storage — current storage API and key-naming convention.
