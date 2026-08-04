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

- pixi-vn-getting-started — `Game.init`/`Game.onNavigate` and the rest of the top-level `Game` API.
- pixi-vn-storage — variables/flags/stored classes that end up inside a save, and reserved keys.
- pixi-vn-history — `stepHistory.stepLimitSaved` and what survives a save/load for "go back".
- pixi-vn-canvas — `canvas.extractImage()` for save thumbnails, and what canvas state gets saved.
- pixi-vn-migration — renames affecting this area (`getSaveData` → `Game.exportGameState`, etc.).
