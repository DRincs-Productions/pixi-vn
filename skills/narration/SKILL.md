---
name: pixi-vn-narration
description: Use when writing or editing Pixi'VN story content — defining labels (scenes) with newLabel, writing dialogue steps, adding player choices with newChoiceOption/newCloseChoiceOption, conditional/branching labels, or wiring up narration.call/jump/continue and Game.start to progress the story.
---

# Pixi'VN Narration module

## When to use this skill

Use this skill whenever the task is about the story itself: creating a new scene/label, writing a
line of dialogue, adding a menu of player choices, branching a label's content based on game state,
or driving story progression (starting the game, moving to the next step, calling/jumping between
labels). This is the core engine of Pixi'VN — almost every "write a scene" or "add a choice" request
touches this module.

Do not use this skill for: character definitions/appearance (see `pixi-vn-characters`), undo/go-back
mechanics (see `pixi-vn-history`), save files (see `pixi-vn-saves`), or persistent game variables
(see `pixi-vn-storage`).

Official docs for this module: https://pixi-vn.com/start/narration (overview),
https://pixi-vn.com/start/labels and https://pixi-vn.com/start/labels-flow (labels/steps/flow),
https://pixi-vn.com/start/labels-advanced (hooks, dynamic steps), https://pixi-vn.com/start/dialogue,
https://pixi-vn.com/start/choices, https://pixi-vn.com/start/input.

## 1. Defining a label

A **label** is the Pixi'VN equivalent of a Ren'Py "bookmark"/landmark in the story (the same concept
is called a `knot` in the _ink_ language): a container for an ordered list of **steps** (plain
functions), each one run when the player advances the story. Labels are created with `newLabel` and
are automatically registered so they can be referenced by id anywhere (choices, `narration.call`,
`narration.jump`, `Game.start`).

```ts
import { narration, newLabel } from "@drincs/pixi-vn";

const startLabel = newLabel("start", [
  () => {
    narration.dialogue = "Welcome to the game!";
  },
  () => {
    narration.dialogue = { character: "liam", text: "Hi, I'm Liam." };
  },
]);
```

Key points:

- `newLabel(id, steps, props?)` — `id` must be unique across the whole game; `steps` is an array of
  `StepLabelType` functions, executed in order as the player continues; `props` is optional
  (`onStepStart`, `onStepEnd`, `onLoadingLabel` hooks — rarely needed for basic authoring).
- Each step is `(props, { labelId }) => StepLabelResultType | Promise<StepLabelResultType>`. Steps
  can be `async` when they need to `await` something (e.g. calling another label, loading assets).
  Return value is optional — most steps return nothing (`void`); returning a string/object is only
  needed by code that consumes `StepLabelResultType` explicitly.
- Every label file should call `newLabel(...)` at module scope so the label registers itself simply
  by being imported. Make sure the module gets imported somewhere reachable at startup.
- `steps` can also be a **function that returns the array**, e.g. `() => [...]`, which lets step
  content change dynamically based on game state — see "Conditional branching" below.

## 2. Dialogue

Set `narration.dialogue` inside a step to display a line. It accepts either a plain string/array of
strings, or a `DialogueInterface`-shaped object with `text` and an optional `character`:

```ts
// Narrator line (no character)
narration.dialogue = "He thrusts out his hand.";

// A line with a speaker — character can be a registered character's string id...
narration.dialogue = {
  character: "james",
  text: `You're my roommate's replacement, huh?`,
};

// ...or the character object itself, e.g. imported from your characters module
narration.dialogue = { character: liam, text: "Hi, I'm Liam." };
```

Which form to prefer depends on the project's setup — see `pixi-vn-characters` for the full
rationale, but in short: prefer the **instance** unless the `@drincs/pixi-vn/vite` plugin's
`typeFilePath` generation (narrowing `CharacterIdType` to known ids, see `pixi-vn-getting-started`)
is set up, in which case prefer the **string-id form** — it's just as typo-safe then, without
needing to import the character module in every label file.

`narration.dialogue` is a getter too: reading it returns `{ text, character }` (with `character`
resolved to the full `CharacterInterface` when a registered id was used, or `undefined`/the raw
string otherwise).

**Gluing dialogue across steps**: set `narration.dialogGlue = true` _before_ assigning
`narration.dialogue` in a step to have that line's text appended to the current dialogue text
instead of replacing it. This lets a paragraph be split across several steps (each free to change a
character's pose/sprite in between) while it reads to the player as one continuous block of text,
with no waiting/empty-box flash in between. From the official React template
(`src/content/labels/second.label.ts`):

```ts
async () => {
    await showImageContainer("steph", ["fm02-body", "fm02-eyes-joy", "fm02-mouth-smile00"]);
    narration.dialogue = `She enters my room before I'VE even had a chance to.`;
},
async () => {
    await showImageContainer("steph", ["fm02-body", "fm02-eyes-joy", "fm02-mouth-smile00"]);
    narration.dialogGlue = true;
    narration.dialogue = `\n\n...I could've just come back and gotten the platter later...`;
},
```

The player still advances one step at a time as usual (`dialogGlue` only affects how the _text_
accumulates, not whether `continue()`/player input is needed); it resets automatically once a
non-glued `narration.dialogue` assignment is made.

Character objects (`CharacterBaseModel` and registration via `RegisteredCharacters`) are covered by
the `pixi-vn-characters` skill — this module only needs a character's `id` (or the object) to attach
it to a line.

Docs: https://pixi-vn.com/start/dialogue

## 3. Rich text: Markdown and HTML in dialogue

Docs: [pixi-vn.com/start/markup](https://pixi-vn.com/start/markup),
[markup-markdown](https://pixi-vn.com/start/markup-markdown),
[markup-tailwindcss](https://pixi-vn.com/start/markup-tailwindcss).

Pixi'VN isn't tied to any markup language for `narration.dialogue` text, but **Markdown is the
recommended one**, and Markdown can be freely mixed with raw HTML for anything Markdown itself can't
express. Every official template already renders dialogue this way — in the React template
specifically, via `react-markdown` with the `remark-gfm` (GFM tables/strikethrough/etc.) and
`rehype-raw` (allows raw HTML inside the Markdown source) plugins:

```tsx
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

<Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
  {narration.dialogue?.text}
</Markdown>;
```

**When writing dialogue text, default to plain Markdown's classic inline styles** — `*italic*`,
`**bold**`, and similar simple emphasis — rather than reaching for raw HTML/CSS. Only use HTML (or
anything fancier) when the user actually asks for it (e.g. a specific color, an animation, an
underline a specific character always has):

```ts
narration.dialogue = "*She* was **not** amused.";
```

When HTML *is* asked for, the recommended CSS approach (per the docs) is **Tailwind CSS** — already
installed and configured in every official template, optionally with plugins like
`@tailwindcss/typography`, `tw-animate-css`, or `tailwind-animations` for richer text effects. **A
Tailwind-styled inline element inside dialogue text must be `inline-block`** — a plain `inline`
element won't apply `transform`/animation utilities correctly mid-paragraph:

```ts
narration.dialogue = `The night was <span class="inline-block animate-pulse text-violet-400">still</span>.`;
```

## 4. Choices

A choice menu is created by assigning an array to `narration.choices`, typically built with
`newChoiceOption` (opens another label) and/or `newCloseChoiceOption` (just closes the menu and lets
the current label's next step run).

```ts
import {
  narration,
  newChoiceOption,
  newCloseChoiceOption,
  newLabel,
} from "@drincs/pixi-vn";

const choiceLabel = newLabel("choice", [
  () => {
    narration.dialogue = "What do you choose?";
    narration.choices = [
      newChoiceOption("A", ALabel, {}), // default type is "call"
      newChoiceOption("B", BLabel, {}, { type: "jump" }),
      newCloseChoiceOption("Close"),
    ];
  },
  () => {
    narration.dialogue = "end";
  },
]);
```

- `newChoiceOption(text, label, props, options?)` — `text` is the option's label text; `label` is the
  target `Label` object or its string id; `props` are passed to the target label's steps (pass `{}`
  if none are needed); `options.type` is `"call"` (default — the target runs and can return to this
  label afterwards) or `"jump"` (the current label is closed first, no return).
- `newCloseChoiceOption(text, options?)` — closes the choice menu without opening any label; narration
  simply continues into the current label's next step. `options.closeCurrentLabel: true` additionally
  closes the current label when chosen.
- Other `ChoiceInterface` options available in both: `oneTime` (option disappears once chosen),
  `onlyHaveNoChoice` (shown only as a fallback if every other option has been removed), `autoSelect`
  (if it ends up being the only available option, it's chosen automatically without player input).
- Read `narration.choices.list` (a `StoredChoiceInterface[]`, an indexed array — each option carries
  a `choiceIndex`), and call `narration.choices.select(choice, props)` when the player picks one.
  Pass through any `StepLabelProps` the target label needs plus the option's own stored `props`:

```ts
const item = narration.choices.list![0];
await narration.choices.select(item, { ...item.props });
```

`choices.select` dispatches to `narration.call`/`narration.jump`/closing the menu based on the chosen
option's `type`, and records the pick so `narration.queries.alreadyCurrentStepMadeChoices` /
`queries.timesChoiceMade` can reflect past choices (useful for `oneTime` options across replays).

Docs: https://pixi-vn.com/start/choices

## 5. Progressing and closing labels

Docs: https://pixi-vn.com/start/labels-flow

- **Start the game**: `Game.start(label, props)` clears all game data and calls the given label —
  this is the standard entry point, e.g. `Game.start(startLabel, {})`. `label` can be the `Label`
  object itself (what the docs show) or its string id (`Game.start("start", {})`) — both work,
  `Game.start` is a thin wrapper around `narration.call` plus `Game.clear()`.
- **Advance one step**: `await narration.continue(props)` runs the current label's next step. Guard
  advancing with `narration.canContinue` (false while a step is running, or a choice menu / required
  input is pending) — this is the shape a "next" button/handler should use:

```ts
while (narration.canContinue) {
  await narration.continue({});
}
```

- **Call a sub-label** (like a function call — returns to the caller when it runs out of steps):
  `await narration.call(otherLabel, props)`. Can be used both to start the very first label and, from
  inside a step, to invoke a nested label. If you call it from inside a step, **return** the result
  and `await` it, so the history bookkeeping stays correct:

```ts
async (props) => {
  return await narration.call(otherLabel, props);
};
```

- **Jump to another label** (closes the current label first, no return): `await narration.jump(otherLabel, props)`.
  Same rule applies — `return await narration.jump(...)` when called from within a step.
- A label closes automatically once its steps are exhausted; the previously calling label (if any)
  resumes automatically. To close explicitly from within a step (e.g. after setting state), just
  `return` — Pixi'VN advances past the label's end on the next `continue()`. Use
  `narration.labels.closeCurrent()` / `narration.labels.closeAll()` only for lower-level manual stack
  control (`closeAll()` ends the game if nothing is called afterwards).
- `narration.labels.opened` and `narration.labels.current` reflect the current call stack of nested
  labels, useful for debugging/branching logic.
- **Going back a step** is handled by the history module, not `narration` — see `stepHistory.back()` /
  `stepHistory.canGoBack` in the `pixi-vn-history` skill.

## 6. Input prompts

Docs: https://pixi-vn.com/start/input

To ask the player for a value (string, number, or an HTML element like a textarea), call
`narration.input.request` inside a step; the engine will not let the story continue
(`narration.canContinue` is `false`) until a value is provided by the UI:

```ts
() => {
    narration.dialogue = "What is your name?";
    narration.input.request({ type: "string" });
},
() => {
    narration.dialogue = `My name is ${narration.input.value}`;
},
() => {
    narration.dialogue = "How old are you?";
    narration.input.request({ type: "number" }, 18); // second arg is an optional default value
},
```

- `narration.input.request(info?, defaultValue?)` — `info` is `InputInfo` minus `isRequired` (e.g.
  `{ type: "string" }`, `{ type: "number" }`, `{ type: "html textarea" }`); omit it for a plain text
  input.
- `narration.input.isRequired` / `narration.input.type` tell the UI layer whether a prompt is pending
  and what kind, so it can render the right control.
- `narration.input.value` holds the submitted value once the UI resolves the prompt — read it in a
  later step to use what the player typed.
- `narration.input.removeRequest()` cancels a pending request without a value (rarely needed in normal
  authoring).

## 7. Conditional branching

Because `steps` can be a function, a label's content can change based on stored state — e.g. showing
different dialogue on a repeat visit:

```ts
import { narration, newLabel, storage } from "@drincs/pixi-vn";

const talkAliceQuest = newLabel("talk-alice-quest", () => {
  if (storage.flags.get("test") === false) {
    return [
      () => {
        narration.dialogue = {
          character: "alice",
          text: "Hi, can you order me a book?",
        };
      },
      () => {
        narration.dialogue = { character: "mc", text: "Ok" };
      },
      async (props) => {
        storage.flags.set("test", true);
        await narration.continue(props);
      },
    ];
  }
  return [
    () => {
      narration.dialogue = { character: "alice", text: "Thanks for the book." };
    },
  ];
});
```

The function re-runs every time the engine needs to know the label's steps, so branch on stable
storage flags/variables (see `pixi-vn-storage`) rather than on anything that changes mid-step. The
last step in a branch can `await narration.continue(props)` itself if it wants to immediately
auto-advance past a "setup" step instead of waiting for another player input.

## 8. Other useful narration bits

Docs: https://pixi-vn.com/start/other-narrative-features

- `Game.onEnd(async (props) => {...})` runs once every open label's steps are exhausted and nothing
  else is called — the standard place to navigate to an ending screen, or to `narration.call`/`jump`
  back into a menu/loop label if the game should never truly "end".
- `narration.getRandomNumber(...)` gives a seeded-safe random number (prefer this over raw `Math.random`
  so saves/rollback stay deterministic).
- `narration.queries.isLabelAlreadyCompleted(label | labelId)` checks whether a label has fully run before —
  handy for "seen this scene already" branching.
- `narration.currentStepTimesCounter` counts how many times the _current_ step has executed (only
  increments when actually read, and only once per step execution); set it to `0` to reset. Useful for
  "show this the first time only" logic inside a dynamic step-list function.

## 9. Real-world project convention (official React template)

The library itself doesn't mandate any file layout or UI wiring — the points below are how
`npm create pixi-vn@latest`'s official "TS narration + React" template does it, as seen in
`pixi-vn-react-template`. Treat this as one convention worth following/recognizing, not a hard
requirement: other narration styles (e.g. an _ink_-based project) will have their own skill and
their own conventions.

- **File layout**: each scene lives in its own `src/content/labels/<name>.label.ts`, exporting a
  `newLabel(...)` result (e.g. `second.label.ts` exports `secondPart = newLabel("second_part", [...])`).
  Character definitions live alongside under `src/content/characters/`.
- **Auto-registration**: `src/content/index.ts` does
  `import.meta.glob(["./**/*.ts", "!./index.ts"], { eager: true })` (a Vite feature) to eagerly import
  every module under `content/` for its side effects at startup. Since `newLabel`/character
  registration runs at module scope, a new label file just needs to exist under `content/` — no
  manual import list to maintain.
- **Driving narration from the UI** (see `lib/hooks/narration-hooks.ts` and
  `lib/query/narration-query.ts`): a "next" handler guards on `narration.canContinue` before calling
  `await narration.continue(gameProps)`; a choice handler reads `narration.choices.list` and calls
  `await narration.choices.select(item, gameProps)`; an input prompt reads
  `narration.input.isRequired` / `narration.input.type` / `narration.input.value`. Real code wraps all
  three in a loading-state guard (e.g. a `GameStatus.setLoading(true/false)` store) so double-clicks
  can't fire concurrent `continue()`/`choices.select()` calls, and a combined
  `narration.canContinue && !narration.input.isRequired` is a convenient "can the player press next"
  check for enabling/disabling a next button.
- `gameProps` above is just that project's augmented `StepLabelProps` (translation function,
  router navigate, toast, etc., declared via TS module augmentation in `pixi-vn.d.ts`) — it's plain
  application data, not something the narration module requires.

## Related skills

pixi-vn-getting-started, pixi-vn-characters, pixi-vn-history, pixi-vn-storage
