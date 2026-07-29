---
name: pixi-vn-storage
description: Use when reading or writing persistent game variables in a @drincs/pixi-vn game — simple flags/counters via `storage`, custom persisted classes via `StoredClassModel`, temporary (label-scoped) variables, and how any of this survives save/load and history go-back. Load this before writing any `storage.set`/`storage.get`/`storage.setFlag` code or a class that extends `StoredClassModel`.
---

# Pixi'VN Storage

## When to use this skill

Use this skill whenever a task involves storing game state that must persist
across steps and saves: flags ("has the player met Liam?"), counters (gold,
affection points), arbitrary objects, or a custom class whose instances need
to survive save/load (e.g. a quest-tracking model). It does not cover
characters specifically (see the characters skill, which is itself built on
top of the pattern described here) or how the history/go-back system is
implemented internally (see the history skill).

Official docs (authoritative for terminology and recommended patterns):
[storage](https://pixi-vn.com/start/storage),
[flags](https://pixi-vn.com/start/flags),
[storage classes](https://pixi-vn.com/start/stored-classes),
[temporary storage](https://pixi-vn.com/start/temp-storage),
[save & load](https://pixi-vn.com/start/save).

```ts
import { storage, StoredClassModel } from "@drincs/pixi-vn";
```

(Also available from the narrower `@drincs/pixi-vn/storage` subpath — see `pixi-vn-getting-started` for when to prefer that.) `storage` is a ready-made singleton (`StorageManagerInterface`) — you never instantiate `StorageManager` yourself.

## 1. Simple variables: `storage.set` / `storage.get`

See [pixi-vn.com/start/storage](https://pixi-vn.com/start/storage).

```ts
storage.set("test", "test1");
storage.get("test"); // "test1"

storage.set("Test", "test2"); // keys are case-sensitive, "Test" !== "test"
storage.get("nope"); // undefined

storage.set("variable1", { test: "test", test2: 1 }); // objects/arrays are fine too
storage.set("variable6", null);
storage.set("variable7", undefined); // undefined removes the key entirely
```

Allowed value types (`StorageElementType`, from
`src/storage/types/StorageElementType.ts`): strings, numbers, booleans,
`null`/`undefined`, plain objects and arrays of these — no functions, class
instances, or Maps/Sets. For anything richer, use a `StoredClassModel` (below).

Other `storage` methods:

- `storage.remove(key)` — deletes a variable.
- `storage.setFlag(key, value: boolean)` / `storage.getFlag(key)` — a
  dedicated boolean-flag store ([docs](https://pixi-vn.com/start/flags)), kept
  separate from `set`/`get`; flags default to `false` when never set. Keys are
  case-sensitive here too. The docs recommend flags over `storage.set` for
  booleans specifically because of save size: internally all active flags are
  kept as a single array of names, which is much lighter to serialize than one
  storage entry per boolean. A documented pattern is exposing a class boolean
  property that's backed by a flag name (a string) instead of a literal
  `boolean`, so the getter/setter transparently reads/writes
  `storage.getFlag`/`setFlag`.
- `storage.default = { key: value, ... }` — sets the _starting_ values used
  when the game boots or after `storage.clear()`; if you later `remove()` a
  key (or it was never `set()`), reading it falls back to this default instead
  of `undefined`.
- `storage.clear()` — wipes all stored variables (used by tests/new-game
  flows), after which reads fall back to `storage.default`.
- `storage.base` — the raw underlying `Map`. The docs show wrapping it with
  [Keyv](https://keyv.org/) (`new Keyv({ store: storage.base })`) if you want a
  Keyv-compatible interface on top of the same storage.

### Temporary (label-scoped) variables

See [pixi-vn.com/start/temp-storage](https://pixi-vn.com/start/temp-storage).
`storage.setTempVariable(key, value)` behaves like `storage.set` for reads —
`storage.get(key)` checks temp variables first, then falls back to the
permanent store — but the value is deleted once the `label` it was set in
closes. It's for scratch state that should reset once the player moves on:

```ts
storage.setTempVariable("counter", counter + 1);
// ... reads still go through storage.get("counter")
storage.removeTempVariable("counter");
```

Per the docs' own description of the lifecycle: if the label that set the
temp variable calls another label (nested call, e.g. `call`), the variable
stays accessible from that child label too — it's only deleted once the
_originating_ label itself closes. But if control moves on via `jump`
(closing the current label and starting a new one instead of nesting into
it), the temp variable is gone immediately, since it belonged to the
now-closed label. Implementation-wise this is tracked as a deadline against
how many labels are open on the call stack at the moment `setTempVariable`
runs — see `tests/storage.test.ts`, `setTempVariable & getTempVariable`,
where a temp `counter` set inside a called label keeps incrementing across
`narration.continue()` steps but is reset once `narration.closeCurrentLabel()`
/`closeAllLabels()` unwind the label stack. Don't rely on temp variables for
state that must outlive the label that set it — use `storage.set` for that.

## 2. Custom persisted classes: `StoredClassModel`

See [pixi-vn.com/start/stored-classes](https://pixi-vn.com/start/stored-classes).
For a richer object whose instances need to persist (survive save/load) and
whose fields should be individually get/set, extend `StoredClassModel`
instead of storing a plain object with `storage.set`. Each instance is
identified by a `categoryId` (shared by all instances of that class) plus a
per-instance `id`; properties are read/written with the protected
`getStorageProperty`/`setStorageProperty` helpers:

```ts
import { StoredClassModel } from "@drincs/pixi-vn";

interface QuestProps {
  title: string;
}

class QuestModel extends StoredClassModel implements QuestProps {
  constructor(id: string, props: QuestProps) {
    super("quest", id); // categoryId, instance id
    this.defaultTitle = props.title;
  }
  readonly defaultTitle: string;

  get title(): string {
    return this.getStorageProperty<string>("title") ?? this.defaultTitle;
  }
  set title(value: string) {
    this.setStorageProperty("title", value);
  }

  get completed(): boolean {
    return this.getStorageProperty<boolean>("completed") ?? false;
  }
  set completed(value: boolean) {
    this.setStorageProperty("completed", value);
  }
}

const findLiam = new QuestModel("find_liam", { title: "Find Liam" });
findLiam.completed = true; // persists under the "quest" category
```

The constructor arg passed in (e.g. `props.title`) becomes the _default_, kept
in memory on the instance; `setStorageProperty` writes an override into
storage that takes priority when reading. Passing `undefined` to
`setStorageProperty` removes that property from storage (falling back to the
in-memory default on the next read). This is exactly the pattern
`CharacterBaseModel` uses for `name`/`surname`/`age` — see the characters
skill (the docs' own example uses a plain category name like `"city"`; the
library's built-in models happen to fence theirs as `"___character___"` to
avoid any accidental collision, but that underscore style is just a
convention, not a requirement — a plain string like `"quest"` or `"city"`
works the same way).

## 3. Reserved keys

Do not manually set/read storage keys that collide with the engine's own
bookkeeping. The docs' rule of thumb ([storage
docs](https://pixi-vn.com/start/storage#system-variables)) is: system
variables use a `___`-fenced prefix, so avoid that prefix in your own keys.
The full reserved key list lives in the `SYSTEM_RESERVED_STORAGE_KEYS`
constant (`src/constants.ts`) — in practice most entries are plain namespaced
strings without the `___` fence (`"dialogue"`, `"dialogue:step_counter"`,
`"choice:options"`, `"input:value"`, `"input:info"`, `"character"`,
`"label:opened"`, `"choices:made"`, etc.), with `"___glue___"` being the one
that actually uses the fenced style. Either way, treat every value in that
constant as off-limits for your own `storage.set`/flag keys, to avoid
confusion when inspecting exported save data.

## 4. Relation to save/load and history

The documented, recommended way to build save/load is
[`Game.exportGameState()`](https://pixi-vn.com/start/save#create) /
[`Game.restoreGameState(saveData, navigate)`](https://pixi-vn.com/start/save#load) —
you generally don't touch storage directly for this. Under the hood,
`storage.export()` / `storage.restore(data)` serialize and restore the entire
variable store (main variables + temp-variable deadlines); this is exactly
what the save-game payload embeds under its own `storageData`/`storage` field
alongside narration, sound, and history data (see `tests/saves.test.ts`,
`exportGameState`/`restoreGameState`). Reach for `storage.export()`/`restore()`
directly only if you're building something lower-level than a full game save.

Because a snapshot of storage is captured as part of each recorded history
step (used for `narration.goBack()`/undo), variables set through `storage`
also participate in step-by-step rewind, not just save/load — see the history
skill for how that stepping mechanism works. `storage.clear()` resets
variables back to whatever was set via `storage.default`, which is what tests
use to get a clean slate between scenarios.

## 5. Real-world save/load convention (official React template)

`Game.exportGameState()` (see section 4) returns the raw `GameState` — the
engine's own storage/narration/sound/history payload. It says nothing about
_where_ that payload lives or what metadata a save-slot UI needs (a title, a
timestamp, a thumbnail...). The storage module itself is agnostic here: how
and where you persist the exported state is entirely up to the app.

The official React+TS template (`npm create pixi-vn@latest`, source at
`src/models/GameSaveData.ts` / `src/lib/utils/save-utility.ts`) shows one
concrete way to close that gap — this is _the template's convention_, not a
library requirement:

```ts
interface GameSaveData {
  saveData: GameState; // the raw Game.exportGameState() output
  gameVersion: string;
  date: Date;
  name: string;
  image?: string; // thumbnail, e.g. canvas.extractImage()
}

function createGameSave(options?: {
  image?: string;
  name?: string;
}): GameSaveData {
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

So the pattern is: wrap `Game.exportGameState()`'s return value in an
app-level object carrying save metadata (version, date, display name,
thumbnail), and pass the inner `saveData` field back to
`Game.restoreGameState()` when loading.

Illustrative, not exhaustive — the template then persists that wrapped
`GameSaveData` object rather than the raw game state alone, because real
projects need more than a single blob: numbered save slots and quick-saves
via IndexedDB (`saveGameToIndexDB`/`getSaveFromIndexDB`/
`quickSaveGameToIndexDB`, with a reserved negative-id range for quick-saves),
an auto "refresh save" kept in `localStorage` under a special `-1` id so an
accidental page reload doesn't lose progress, and a downloadable/importable
JSON file (`downloadGameSave`/`loadGameSaveFromFile`) for backing up or
sharing a save outside the app. None of this is prescribed by
`@drincs/pixi-vn` — treat it as one worked example of gluing
`exportGameState`/`restoreGameState` to a real persistence layer, not the
only way to do it.

## Related skills

pixi-vn-getting-started, pixi-vn-characters, pixi-vn-history, pixi-vn-narration
