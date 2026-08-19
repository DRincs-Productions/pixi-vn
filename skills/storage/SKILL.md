---
name: pixi-vn-storage
description: Use when reading or writing persistent game variables in a @drincs/pixi-vn game — simple flags/counters via `storage`, custom persisted classes via `StoredClassModel`, temporary (label-scoped) variables, and how any of this survives save/load and history go-back. Load this before writing any `storage.set`/`storage.get`/`storage.flags.set` code or a class that extends `StoredClassModel`.
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
- `storage.flags.set(key, value: boolean)` / `storage.flags.get(key)` — a
  dedicated boolean-flag store ([docs](https://pixi-vn.com/start/flags)), kept
  separate from `set`/`get`; flags default to `false` when never set. Keys are
  case-sensitive here too. The docs recommend flags over `storage.set` for
  booleans specifically because of save size: internally all active flags are
  kept as a single array of names, which is much lighter to serialize than one
  storage entry per boolean. A documented pattern is exposing a class boolean
  property that's backed by a flag name (a string) instead of a literal
  `boolean`, so the getter/setter transparently reads/writes
  `storage.flags.get`/`set`.
- `storage.default = { key: value, ... }` — sets the _starting_ values used
  when the game boots or after `storage.clear()`; if you later `remove()` a
  key (or it was never `set()`), reading it falls back to this default instead
  of `undefined`.
- `storage.clear()` — wipes all stored variables (used by tests/new-game
  flows), after which reads fall back to `storage.default`.

### Temporary (label-scoped) variables

See [pixi-vn.com/start/temp-storage](https://pixi-vn.com/start/temp-storage).
`storage.temp.set(key, value)` behaves like `storage.set` for reads —
`storage.get(key)` checks temp variables first, then falls back to the
permanent store — but the value is deleted once the `label` it was set in
closes. It's for scratch state that should reset once the player moves on:

```ts
storage.temp.set("counter", counter + 1);
// ... reads still go through storage.get("counter")
storage.temp.remove("counter");
```

Per the docs' own description of the lifecycle: if the label that set the
temp variable calls another label (nested call, e.g. `call`), the variable
stays accessible from that child label too — it's only deleted once the
_originating_ label itself closes. But if control moves on via `jump`
(closing the current label and starting a new one instead of nesting into
it), the temp variable is gone immediately, since it belonged to the
now-closed label. Implementation-wise this is tracked as a deadline against
how many labels are open on the call stack at the moment `temp.set`
runs — see `tests/storage.test.ts`, `setTempVariable & getTempVariable`,
where a temp `counter` set inside a called label keeps incrementing across
`narration.continue()` steps but is reset once `narration.labels.closeCurrent()`
/`closeAll()` unwind the label stack. Don't rely on temp variables for
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

Building save/load itself (the `Game.exportGameState()`/`restoreGameState()` flow, and how to
persist the result) is covered by `pixi-vn-saves` — you generally don't touch storage directly for
that; every variable set through `storage` is included automatically. The same is true for
step-by-step rewind: a snapshot of storage is captured at each recorded history step, so `storage`
variables participate in "go back" too, not just save/load — see `pixi-vn-history`. `storage.clear()`
resets variables back to whatever was set via `storage.default`, which is what tests use to get a
clean slate between scenarios.

## Related skills

pixi-vn-getting-started, pixi-vn-saves, pixi-vn-characters, pixi-vn-history, pixi-vn-narration
