---
name: pixi-vn-saves
description: Use when implementing save/load in a Pixi'VN game — Game.exportGameState()/restoreGameState()/jsonToGameState(), what the exported GameState contains, and how to persist it (save slots, quick-save, auto-save-on-refresh, downloadable JSON). Load this before writing any save-file, save-slot, or "continue game" feature.
---

# Pixi'VN Saves: exporting, restoring, and persisting game state

Official docs: [pixi-vn.com/start/save](https://pixi-vn.com/start/save).

## When to use this skill

Use this skill whenever a task involves saving/loading the game: a save-file format, save slots, a
quick-save shortcut, "continue where I left off" after a page refresh, or exporting/importing a save
as a file. This skill does not cover the module-level details of what's *inside* a save (storage
variables — `pixi-vn-storage`; canvas element state — `pixi-vn-canvas`; step/backlog history —
`pixi-vn-history`) — only the save/load flow itself and how those pieces fit together.

## The core trio

```ts
import { Game } from "@drincs/pixi-vn";

Game.exportGameState(): GameState
Game.restoreGameState(data: GameState): Promise<void>
Game.jsonToGameState(json: string): GameState
```

- **`Game.exportGameState()`** returns a plain `GameState` object — version info plus the current
  storage, canvas, sound, and history data — suitable for `JSON.stringify`.
- **`Game.restoreGameState(data)`** restores everything from a previously exported `GameState`,
  using whatever navigate function was set via `Game.onNavigate`/`Game.init`'s `navigate` option —
  it no longer takes a navigate function as a second argument.
- **`Game.jsonToGameState(json)`** just parses a JSON string back into a `GameState` — a thin
  wrapper around `JSON.parse` with the right type, for symmetry with `exportGameState`.

```ts
const json = JSON.stringify(Game.exportGameState());
// ... later, possibly after a page reload ...
await Game.restoreGameState(Game.jsonToGameState(json));
```

## What's inside a `GameState`

A `GameState` bundles every module's current state: storage variables, the canvas's saved
element/layer state (if the canvas was initialized), sound's channel/media state, and go-back
history (capped by `stepHistory.stepLimitSaved`, default `20` — see `pixi-vn-history` for what that
limit means for how far a player can go back after loading). `Game.exportGameState`/
`restoreGameState` is the layer application code should use — there's no need to go through any
individual module directly for a full game save.

## Extending the save state (export/restore hooks)

A third-party library (or a game) that keeps its own state outside Pixi'VN's modules can add it to
every save and read it back on load, without wrapping `exportGameState`/`restoreGameState`:

```ts
import { Game } from "@drincs/pixi-vn";

// Type the custom data with module augmentation of the public GameState interface.
declare module "@drincs/pixi-vn" {
    interface GameState {
        myLibraryData?: { score: number };
    }
}

// Runs on the complete object before exportGameState() returns it; mutate it in place.
Game.addOnExportGameState(async (state) => {
    state.myLibraryData = { score: await getScore() };
});

// Receives the exact object passed to restoreGameState().
// timing "before" (default): before any built-in module is restored.
// timing "after": after built-in restoration and navigation have completed.
Game.addOnRestoreGameState((state) => myLibrary.load(state.myLibraryData));
Game.addOnRestoreGameState(() => myLibrary.refresh(), { timing: "after" });
```

- Handlers may be sync or async; they are awaited **sequentially in registration order**, and an
  error thrown by a handler propagates to the `exportGameState`/`restoreGameState` caller.
- Both `add*` methods return a function that unregisters the handler; `Game.removeOnExportGameState(handler)`
  / `Game.removeOnRestoreGameState(handler)` do the same and leave other handlers registered.
- Handler types are exported from the root: `OnExportGameStateHandler`, `OnRestoreGameStateHandler`,
  `OnRestoreGameStateOptions`, `GameStateHookTiming`.
- Make custom properties optional (`?`) — saves created before the library was added won't have them.

## Loading a save after a game update

Available since `@drincs/pixi-vn` 1.9.10.

A save records, for every opened label, the current step index **and the sha1 of that step's source
code** (`OpenedLabel.stepSha1`). On `Game.restoreGameState`, every opened label is checked against
the labels registered in the current version of the game. You don't need to call anything:

| What changed since the save | What happens on load |
| --- | --- |
| Nothing, or only steps the player already passed | Restored as saved. |
| Steps added/removed **before** the current one | The current step is found by its sha1 and its index is relocated, so nothing is repeated or skipped. |
| The current step was changed or removed, or a label in the stack was deleted/renamed | The engine walks the save's go-back history backwards **in memory** to the most recent step that still exists unchanged, then restores storage, canvas and sound **once**, at that step. The next `continue()` runs the new content. |
| As above, but the history can't reach a valid step (`stepLimitSaved`, `blockGoBack()`) | Only the narration pointer is repaired: deleted labels are closed, a changed current step is re-run on the next `continue()`. |
| Nothing valid is left (e.g. the root label was deleted) | Handlers registered with `Game.addOnError` receive a `PixiError` with code `"obsolete_save"`; no label is left open. |

```ts
import { Game, PixiError } from "@drincs/pixi-vn";

Game.addOnError((error) => {
    if (error instanceof PixiError && error.code === "obsolete_save") {
        // e.g. tell the player and go back to the main menu with your app's own router
        // (the step props passed to this handler are empty: no step is running while loading)
        showObsoleteSaveMessage();
    }
});
```

- Renaming a label id counts as deleting it. Keep ids stable across releases.
- Going back after a relocated load (`stepHistory.back`) is relocated too.
- Detection relies on `LabelAbstract.getStepSha`: custom label classes whose steps all return the same
  sha1 (or `undefined`) can't be checked, so their saves are restored as before. Saves made with
  older Pixi'VN versions have no `stepSha1` and are restored as-is.

## Real-world persistence convention (official React template)

`Game.exportGameState()` says nothing about *where* that payload lives or what metadata a save-slot
UI needs (title, timestamp, thumbnail). That part is entirely up to the app. The official React+TS
template (`npm create pixi-vn@latest`, source at `src/models/GameSaveData.ts` /
`src/lib/utils/save-utility.ts`) shows one concrete way to close that gap — **this is the template's
convention, not a library requirement**:

```ts
interface GameSaveData {
  saveData: GameState; // the raw Game.exportGameState() output
  gameVersion: string;
  date: Date;
  name: string;
  image?: string; // thumbnail, e.g. canvas.extractImage() — see pixi-vn-canvas
}

function createGameSave(options?: { image?: string; name?: string }): GameSaveData {
  return {
    saveData: Game.exportGameState(),
    gameVersion: __APP_VERSION__,
    date: new Date(),
    name: options?.name ?? "",
    image: options?.image,
  };
}

async function loadSave(saveData: GameSaveData) {
  await Game.restoreGameState(saveData.saveData);
}
```

The pattern: wrap `exportGameState()`'s return value in an app-level object carrying save metadata,
and pass the inner `saveData` field back into `restoreGameState()` when loading.

From there, the template persists that wrapped `GameSaveData` object (not the raw game state alone)
through several concrete mechanisms — illustrative, not exhaustive:

- **Numbered save slots via IndexedDB** (`saveGameToIndexDB`/`getSaveFromIndexDB`/
  `deleteSaveFromIndexDB`), auto-incrementing from `0`.
- **Quick save slots**, also via IndexedDB (`quickSaveGameToIndexDB`), reserved to a fixed negative-id
  range below the numbered saves (e.g. ids `-2..-7` for 6 slots) so they never collide with manual
  saves. Each quick-save fills the first empty slot, then cycles by overwriting the
  least-recently-used slot once all slots are full.
- **An "auto exit save"** (`addAutoExitSave`, paired with a `useAutoSaveOnPageClose` hook bound to
  the `beforeunload` and `visibilitychange` events) stringified straight into `localStorage` under
  its own key — not through IndexedDB — so an accidental tab close or reload doesn't lose progress.
- **A "Continue" button**: `getLastSaveFromIndexDB` powers a main-menu "Continue" action by comparing
  the latest numbered IndexedDB save against the auto exit save and returning whichever is newer
  (synthesizing id `-1` for the auto exit save for that comparison) — `null` if neither exists, to
  disable the button; the result feeds straight into `loadSave`.
- **A downloadable/importable JSON file** (`downloadGameSave`/`loadGameSaveFromFile`) for backing up
  or sharing a save outside the app.

None of this is prescribed by `@drincs/pixi-vn` — treat it as one worked example of gluing
`exportGameState`/`restoreGameState` to a real persistence layer, not the only way to do it.

## Related skills

- pixi-vn — `Game.init`/`Game.onNavigate` and the rest of the top-level `Game` API.
- pixi-vn-storage — variables/flags/stored classes that end up inside a save, and reserved keys.
- pixi-vn-history — `stepHistory.stepLimitSaved` and what survives a save/load for "go back".
- pixi-vn-canvas — `canvas.extractImage()` for save thumbnails, and what canvas state gets saved.
- pixi-vn-migration — renames affecting this area (`getSaveData` → `Game.exportGameState`, etc.).
