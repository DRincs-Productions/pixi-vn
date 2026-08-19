---
name: pixi-vn-migration
description: Use when upgrading an existing @drincs/pixi-vn project to a newer version, or when a runtime/type error matches a known breaking change. Covers every breaking change between versions with before/after code.
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

## v1.8.x → v1.9.0 — long-deprecated APIs removed

This release removes several APIs that had been marked `@deprecated` for a while, with no
replacement other than the one already documented at deprecation time:

`Repeat`/`Pause(duration)` and the `RepeatType`/`PauseType` types are gone. `canvas.addTickersSequence`
now only accepts plain `Ticker` steps — chain tickers by duration instead of pause/repeat markers:

```ts
canvas.addTickersSequence("alien", [
  new RotateTicker({ speed: 0.1, clockwise: true }, 2),
  Pause(1), // [!code --]
  new RotateTicker({ speed: 0.2, clockwise: false }, 2),
  Repeat, // [!code --]
]);
```

See `pixi-vn-canvas`/`tickers.md` for the current sequencing API.
`forceCompleteBeforeNext` is gone from every transition helper (`showWithDissolve`, `moveIn`,
`zoomIn`, ...) and from `CommonTickerProps` — use `completeOnContinue` directly, it's no longer
just an alias:

```ts
await showWithDissolve("alice", "alice", {
  forceCompleteBeforeNext: true, // [!code --]
  completeOnContinue: true, // [!code ++]
});
```

The deprecated `AssetMemory.image` field was removed; use `AssetMemory.alias`/`url` instead.
`Game.restoreGameState(data, navigate)` lost its `navigate` overload — pass only `data`, and
configure navigation once via `Game.onNavigate` (or `Game.init({ navigate })`) instead:

```ts
Game.restoreGameState(data, navigateTo); // [!code --]
Game.restoreGameState(data); // [!code ++]
```

The singular `Game.onError(...)` handler was removed; use `Game.addOnError`/`Game.removeOnError`
(already the recommended API since v1.6.0):

```ts
Game.onError((type, error, { notify, uiTransition }) => { ... }); // [!code --]
Game.addOnError((error, { notify, uiTransition }) => { ... }); // [!code ++]
```

See `pixi-vn-canvas`/`tickers.md` for the current tickers/transitions API and
`pixi-vn-getting-started` for the current `Game` API.

### Manager APIs reorganized into namespaces

The `canvas`, `sound`, `storage`, and `narration` managers used to expose dozens of unrelated
methods directly on the manager (ticker methods, layer methods, and HTML-layer methods all mixed
together on `canvas`, for example). This release groups related operations into namespaced
sub-APIs — `canvas.tickers`/`.layers`/`.htmlLayers`, `sound.channels`/`.unsaved`,
`storage.temp`/`.flags`, `narration.labels`/`.queries`/`.input`/`.choices` — so each manager reads
as a short, discoverable surface instead of a flat list, and related options/overloads live next to
each other. See `pixi-vn-canvas`, `pixi-vn-sound`, `pixi-vn-storage`, and `pixi-vn-getting-started`
for the current shape of each namespace.

Almost every old flat method still works and just forwards to its namespaced replacement — it's
marked `@deprecated` but not removed, so migrate at your own pace. Two members are an exception:
their **type** changed, so they break immediately rather than just warning.

`sound.channels` was `AudioChannelInterface[]`; it is now an object, and the array moved to
`.values`:

```ts
sound.channels.map((c) => c.alias); // [!code --]
sound.channels.values.map((c) => c.alias); // [!code ++]
```

`narration.choices` (getter) was `StoredIndexedChoiceInterface[] | undefined`; it now returns a
namespace object, and the array moved to `.list`. The *setter*, `narration.choices = [...]`, is
unchanged — it's a shortcut for `.list`:

```ts
const choices = narration.choices; // [!code --]
const choices = narration.choices.list; // [!code ++]
```

Every other rename below is a non-breaking, forward-compatible deprecation.

`canvas`'s ticker methods moved to `canvas.tickers`:

```ts
canvas.transferTickers("old", "new"); // [!code --]
canvas.tickers.transfer("old", "new"); // [!code ++]
```

```ts
canvas.currentTickers; // [!code --]
canvas.tickers.currentTickers; // [!code ++]
```

```ts
canvas.currentTickersSteps; // [!code --]
canvas.tickers.currentTickersSteps; // [!code ++]
```

```ts
canvas.findTicker("t1"); // [!code --]
canvas.tickers.find("t1"); // [!code ++]
```

```ts
canvas.addTicker("alien", new RotateTicker({ speed: 0.2 })); // [!code --]
canvas.tickers.add("alien", new RotateTicker({ speed: 0.2 })); // [!code ++]
```

```ts
canvas.addTickersSequence("alien", steps); // [!code --]
canvas.tickers.addSequence("alien", steps); // [!code ++]
```

```ts
canvas.unlinkComponentFromTicker("alien", RotateTicker); // [!code --]
canvas.tickers.unlinkComponent("alien", RotateTicker); // [!code ++]
```

```ts
canvas.removeAllTickers(); // [!code --]
canvas.tickers.removeAll(); // [!code ++]
```

```ts
canvas.removeTicker("t1"); // [!code --]
canvas.tickers.remove("t1"); // [!code ++]
```

```ts
canvas.pauseTicker({ canvasAlias: "alien" }); // [!code --]
canvas.tickers.pause({ canvasAlias: "alien" }); // [!code ++]
```

```ts
canvas.resumeTicker({ canvasAlias: "alien" }); // [!code --]
canvas.tickers.resume({ canvasAlias: "alien" }); // [!code ++]
```

```ts
canvas.isTickerPaused("alien"); // [!code --]
canvas.tickers.isPaused("alien"); // [!code ++]
```

```ts
canvas.completeTickerOnStepEnd({ id: "t1" }); // [!code --]
canvas.tickers.completeOnStepEnd({ id: "t1" }); // [!code ++]
```

```ts
canvas.forceCompletionOfTicker("t1"); // [!code --]
canvas.tickers.forceCompletion("t1"); // [!code ++]
```

```ts
canvas.onTickerComplete("t1", options); // [!code --]
canvas.tickers.onComplete("t1", options); // [!code ++]
```

`canvas`'s layer methods moved to `canvas.layers`:

```ts
canvas.gameLayer; // [!code --]
canvas.layers.gameLayer; // [!code ++]
```

```ts
canvas.addLayer("ui", uiLayer); // [!code --]
canvas.layers.add("ui", uiLayer); // [!code ++]
```

```ts
canvas.getLayer("ui"); // [!code --]
canvas.layers.get("ui"); // [!code ++]
```

```ts
canvas.removeLayer("ui"); // [!code --]
canvas.layers.remove("ui"); // [!code ++]
```

`canvas`'s HTML-layer methods moved to `canvas.htmlLayers`:

```ts
canvas.addHtmlLayer("ui", root); // [!code --]
canvas.htmlLayers.add("ui", root); // [!code ++]
```

```ts
canvas.getHtmlLayer("ui"); // [!code --]
canvas.htmlLayers.get("ui"); // [!code ++]
```

```ts
canvas.removeHtmlLayer("ui"); // [!code --]
canvas.htmlLayers.remove("ui"); // [!code ++]
```

`sound`'s transient/unsaved playback methods moved to `sound.unsaved`:

```ts
sound.playTransient("ui-click"); // [!code --]
sound.unsaved.playTransient("ui-click"); // [!code ++]
```

```ts
sound.pauseUnsavedAll(); // [!code --]
sound.unsaved.pauseAll(); // [!code ++]
```

```ts
sound.resumeUnsavedAll(); // [!code --]
sound.unsaved.resumeAll(); // [!code ++]
```

```ts
sound.stopTransientAll(); // [!code --]
sound.unsaved.stopTransientAll(); // [!code ++]
```

`sound`'s channel creation/lookup methods moved to `sound.channels` (alongside the `.values` change
above):

```ts
sound.addChannel("music"); // [!code --]
sound.channels.add("music"); // [!code ++]
```

```ts
sound.findChannel("music"); // [!code --]
sound.channels.find("music"); // [!code ++]
```

`storage`'s temporary-variable methods moved to `storage.temp` (a new `storage.temp.deadlines` map
is exposed alongside them):

```ts
storage.setTempVariable("key", "value"); // [!code --]
storage.temp.set("key", "value"); // [!code ++]
```

```ts
storage.removeTempVariable("key"); // [!code --]
storage.temp.remove("key"); // [!code ++]
```

`storage`'s flag methods moved to `storage.flags`:

```ts
storage.setFlag("introSeen", true); // [!code --]
storage.flags.set("introSeen", true); // [!code ++]
```

```ts
storage.getFlag("introSeen"); // [!code --]
storage.flags.get("introSeen"); // [!code ++]
```

`narration`'s label-stack members moved to `narration.labels`:

```ts
narration.openedLabels; // [!code --]
narration.labels.opened; // [!code ++]
```

```ts
narration.currentLabel; // [!code --]
narration.labels.current; // [!code ++]
```

```ts
narration.closeCurrentLabel(); // [!code --]
narration.labels.closeCurrent(); // [!code ++]
```

```ts
narration.closeAllLabels(); // [!code --]
narration.labels.closeAll(); // [!code ++]
```

`narration`'s read-only queries moved to `narration.queries`:

```ts
narration.isLabelAlreadyCompleted(label); // [!code --]
narration.queries.isLabelAlreadyCompleted(label); // [!code ++]
```

```ts
narration.alreadyCurrentStepMadeChoices; // [!code --]
narration.queries.alreadyCurrentStepMadeChoices; // [!code ++]
```

```ts
narration.isCurrentStepAlreadyOpened; // [!code --]
narration.queries.isCurrentStepAlreadyOpened; // [!code ++]
```

```ts
narration.getTimesLabelOpened(label); // [!code --]
narration.queries.timesLabelOpened(label); // [!code ++]
```

```ts
narration.getTimesChoiceMade(index); // [!code --]
narration.queries.timesChoiceMade(index); // [!code ++]
```

`narration`'s input-request members moved to `narration.input`:

```ts
narration.inputValue; // [!code --]
narration.input.value; // [!code ++]
```

```ts
narration.isRequiredInput; // [!code --]
narration.input.isRequired; // [!code ++]
```

```ts
narration.inputType; // [!code --]
narration.input.type; // [!code ++]
```

```ts
narration.requestInput({ type: "number" }); // [!code --]
narration.input.request({ type: "number" }); // [!code ++]
```

```ts
narration.removeInputRequest(); // [!code --]
narration.input.removeRequest(); // [!code ++]
```

`narration`'s choice selection moved to `narration.choices` (alongside the `.list` change above):

```ts
narration.selectChoice(choices[0], {}); // [!code --]
narration.choices.select(choices[0], {}); // [!code ++]
```

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
