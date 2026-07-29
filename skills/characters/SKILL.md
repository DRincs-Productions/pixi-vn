---
name: pixi-vn-characters
description: Use when defining visual novel characters for a @drincs/pixi-vn game — creating a character with a name, color, icon and other props, registering it so it can be looked up by id, and referencing it from dialogue/narration. Load this before writing any `CharacterBaseModel` or `RegisteredCharacters` code.
---

# Pixi'VN Characters

## When to use this skill

Use this skill whenever a task involves creating the characters that appear in a
Pixi'VN game (name, surname, age, color, icon, and any custom fields), storing
them so the engine and narration code can find them by id, or hooking a
character into a `narration.dialogue` line. It does not cover how dialogue/text
itself is displayed (see the narration skill) or how variables are generally
saved (see the storage skill).

```ts
import { CharacterBaseModel, RegisteredCharacters } from "@drincs/pixi-vn";
```

(Also available from the narrower `@drincs/pixi-vn/characters` subpath — see `pixi-vn-getting-started` for when to prefer that.)

Full reference: https://pixi-vn.com/start/character

## 1. Defining a character

`CharacterBaseModel` is the built-in character class. Construct it with a
unique string `id` and a props object (`name`, `surname`, `age`, `icon`,
`color` — all optional):

```ts
import { CharacterBaseModel } from "@drincs/pixi-vn";

export const liam = new CharacterBaseModel("liam", {
    name: "Liam",
    surname: "Smith",
    age: 25,
    icon: "https://example.com/liam.png",
    color: "#9e2e12",
});

export const emma = new CharacterBaseModel("emma", {
    name: "Emma",
    surname: "Johnson",
    age: 23,
    icon: "https://example.com/emma.png",
    color: "#c23b7f",
});
```

The `id` is the value used everywhere else in the game (dialogue, lookups,
history) to reference this character, so it must be unique and stable across
saves.

`name`/`surname`/`age` are actually get/set accessors backed by the game's
storage (see `CharacterStoredClass`, which `CharacterBaseModel` extends, and
the [stored classes](https://pixi-vn.com/start/stored-classes) doc): the value
passed in the constructor becomes the *default*, but setting `liam.name = "..."`
at runtime persists an override in storage that survives save/load and takes
priority over the default. `icon` and `color` are plain readonly fields, not
stored/overridable at runtime.

```ts
import { liam } from "@/content/characters";

console.log(liam.name); // "Liam"
liam.name = "Liam Smith";
console.log(liam.name); // "Liam Smith" — now persisted in game storage
```

If a character's `id` is ever changed between game versions, the engine does
**not** migrate the storage data from the old id to the new one — treat ids as
permanent once shipped.

### Custom character classes with extra fields

If you need fields beyond `name`/`surname`/`age`/`icon`/`color` (e.g. a
`sprite` id or a relationship stat), this is the recommended, docs-endorsed
approach (project templates already ship it as `models/Character.ts`):

1. Create a class `Character extends CharacterStoredClass implements CharacterInterface`.
2. Augment the (otherwise empty) `CharacterInterface` in a `pixi-vn.d.ts` file
   via `declare module "@drincs/pixi-vn"` so every `CharacterInterface`
   consumer in the project — including `RegisteredCharacters.get()` — sees the
   richer, project-specific type.
3. For any field that must persist across saves, back it with a
   getter/setter that calls `this.getStorageProperty()` /
   `this.setStorageProperty()` (inherited from `CharacterStoredClass`), the
   same pattern `CharacterBaseModel` uses internally for `name`/`surname`/`age`.

This is exactly what the official `pixi-vn-react-template` (the "TS narration
+ React" project `npm create pixi-vn@latest` scaffolds) ships as
`src/models/Character.ts` — stored getters/setters for `name`, `surname` and
`age`, and plain (non-stored) fields for `icon`/`color`:

```ts
// models/Character.ts
import { type CharacterInterface, CharacterStoredClass } from "@drincs/pixi-vn";

export default class Character extends CharacterStoredClass implements CharacterInterface {
    constructor(id: string | { id: string; emotion: string }, props: CharacterProps) {
        super(typeof id === "string" ? id : id.id, typeof id === "string" ? "" : id.emotion);
        this.defaultName = props.name;
        this.defaultSurname = props.surname;
        this.defaultAge = props.age;
        this.icon = props.icon;
        this.color = props.color;
    }

    // stored — persists across save/load, same pattern as CharacterBaseModel
    private defaultName?: string;
    get name(): string {
        return this.getStorageProperty<string>("name") || this.defaultName || this.id;
    }
    set name(value: string | undefined) {
        this.setStorageProperty<string>("name", value);
    }

    private defaultSurname?: string;
    get surname(): string | undefined {
        return this.getStorageProperty<string>("surname") || this.defaultSurname;
    }
    set surname(value: string | undefined) {
        this.setStorageProperty<string>("surname", value);
    }

    private defaultAge?: number;
    get age(): number | undefined {
        return this.getStorageProperty<number>("age") || this.defaultAge;
    }
    set age(value: number | undefined) {
        this.setStorageProperty<number>("age", value);
    }

    // not stored
    readonly icon?: string;
    readonly color?: string;
}

interface CharacterProps {
    name?: string;
    surname?: string;
    age?: number;
    icon?: string;
    color?: string;
}
```

```ts
// pixi-vn.d.ts
declare module "@drincs/pixi-vn" {
    interface CharacterInterface {
        name: string;
        surname?: string;
        age?: number;
        readonly icon?: string;
        readonly color?: string;
    }
}
```

## 2. Registering and looking up characters

Characters are looked up at runtime by id through the `RegisteredCharacters`
registry (a namespace, not a decorator despite its file name). Calling
`RegisteredCharacters.add(...)` is **required** — a `CharacterBaseModel` (or
custom class) instance that is only exported/constructed but never passed to
`add` will not be findable by id and will not work in dialogue lookups after a
save/load. Register every character you define once, at module load time
(recommended: import them all at project startup), then reference it by id
elsewhere:

```ts
import { RegisteredCharacters } from "@drincs/pixi-vn";

RegisteredCharacters.add(liam, emma);
// or with arrays:
RegisteredCharacters.add([liam, emma]);
```

Other `RegisteredCharacters` functions:

- `RegisteredCharacters.get(id)` — returns the character (or `undefined`,
  logging a warning if it was never registered).
- `RegisteredCharacters.has(id)` — checks whether an id is registered.
- `RegisteredCharacters.values()` — returns all registered characters.
- `RegisteredCharacters.keys()` — returns all registered ids.
- `RegisteredCharacters.clear()` — removes all registered characters (mainly
  useful in tests).

```ts
const liam = RegisteredCharacters.get("liam");
```

Re-adding an id that's already registered overwrites the previous character
(a log message notes this), so registration order matters if two files define
the same id.

### Real-world project convention (official React template)

The official `pixi-vn-react-template` (what `npm create pixi-vn@latest`
scaffolds for the "TS narration + React" setup) defines its characters as
`export const` instances in `src/content/characters.ts`, then registers all of
them with a single `RegisteredCharacters.add([...])` call at module scope:

```ts
// src/content/characters.ts
import Character from "@/models/Character";
import { RegisteredCharacters } from "@drincs/pixi-vn";

export const mc = new Character("mc", { name: "Me" });
export const james = new Character("james", { name: "James", color: "#0084ac" });
export const steph = new Character("steph", { name: "Steph", color: "#ac5900" });
export const sly = new Character("sly", { name: "Sly", color: "#6d00ac" });

RegisteredCharacters.add([mc, james, steph, sly]);
```

This works with no manual import list to maintain because `src/content/index.ts`
uses `import.meta.glob` to import every file under `content/` for its side
effects at app startup — so the module-scope `RegisteredCharacters.add(...)`
call above always runs. That means you never need to remember to import each
new character file yourself (dropping it anywhere under `content/` is
enough), but conversely, a character defined (and `.add`ed) in a file
*outside* `content/` that nothing else imports never gets its `add` call
executed, and stays silently unregistered.

This is **the official template's convention, not a hard requirement of the
library** — `RegisteredCharacters.add` can be called from any file, as long as
it's guaranteed to run before the character is looked up. Projects without
this glob-import setup must import each character file explicitly instead
(e.g. from a top-level `content/index.ts` or the app's entry point).

### Typed ids (optional)

Character ids are typed as `CharacterIdType`, which is `string` by default.
If a project augments the empty `PixivnCharacterIds` interface (typically
auto-generated by the `vitePluginPixivn` Vite plugin's `typeFilePath` option),
`CharacterIdType` narrows to a union of known ids and typos become compile
errors. Don't assume this augmentation exists unless you see a generated
`pixi-vn.gen.d.ts`/similar file in the project — if not, treat ids as plain
strings.

## 3. Emotions

A character id may optionally be paired with an emotion by passing an object
instead of a plain string as the constructor's first argument:

```ts
export const alice = new CharacterBaseModel("alice", {
    name: "Alice",
    icon: "https://example.com/alice.png",
    color: "#9e2e12",
});

export const angryAlice = new CharacterBaseModel(
    { id: "alice", emotion: "angry" },
    { icon: "https://example.com/angryAlice.png" },
);

RegisteredCharacters.add([alice, angryAlice]);
```

Internally this stores the character's `name`/`surname`/`age` under a
separate storage key (`"<id>@<emotion>"`) while still falling back to the
base id's stored/default values if an emotion-specific value isn't set — the
base id and its emotion variants share the same underlying character data
except where the emotion variant overrides it:

```ts
console.log(alice.name); // "Alice"

alice.name = "Eleonora";
console.log(alice.name); // "Eleonora"
console.log(angryAlice.name); // "Eleonora" — falls back to the base id's value

angryAlice.name = "Angry Eleonora";
console.log(alice.name); // "Eleonora" — unaffected
console.log(angryAlice.name); // "Angry Eleonora" — its own override now set
```

Use this only if you need per-emotion overrides of a character's stored
fields; for swapping the character's on-screen sprite/image per emotion,
that's driven by the canvas/image APIs, not this module.

## 4. Using a character in dialogue

Once registered, pass the character instance (or its id string) as the
`character` field of a dialogue, e.g. inside a label step:

```ts
narration.dialogue = { character: liam, text: "Which test do you want to perform?" };
// or by id:
narration.dialogue = { character: "liam", text: "..." };
```

Which form to prefer depends on whether the project's `@drincs/pixi-vn/vite` plugin generates
typed character ids (the `typeFilePath` option covered in `pixi-vn-getting-started`, which narrows
`CharacterIdType` from plain `string` to a union of the actually-registered ids):

- **Without it**, prefer passing the **instance** (`character: liam`) — a bare string id has no
  compile-time typo protection, while the instance is a real variable reference the compiler
  already checks.
- **With it**, prefer the **string-id form** (`character: "liam"`) — it now gets the same
  compile-time safety (a typo like `"liem"` fails to typecheck against the generated
  `CharacterIdType` union) without needing to import the character module wherever a dialogue line
  is written, which keeps label files decoupled from character-definition files.

`DialogueInterface.character` accepts `CharacterInterface | string`; when a
string id is stored, the engine resolves it back to the registered character
object (via `RegisteredCharacters.get`) when the dialogue is read back — so a
character must already be registered by the time its dialogue line runs.
Reading/rendering the resolved dialogue is covered by the narration skill.

## Related skills

pixi-vn-getting-started, pixi-vn-narration, pixi-vn-storage
