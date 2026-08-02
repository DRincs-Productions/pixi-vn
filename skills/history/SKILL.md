---
name: pixi-vn-history
description: Use when implementing "go back" / "rewind" / step-navigation features in a Pixi'VN game, or when you need to read the player-facing dialogue/choice history (e.g. for a backlog or "history log" UI) — covers the History module's `stepHistory` API and the "step" vs "paragraph" goBackMode.
---

# Pixi'VN History module

> Official docs: https://pixi-vn.com/start/history — this skill also documents `goBackMode` and the
> real-world go-back/backlog patterns not detailed on the public page. It sticks to the public
> `stepHistory` API a game actually calls, not how it's implemented internally.

## When to use this skill

Load this skill whenever a task involves: letting the player undo the last line(s) of dialogue ("go back" / "rewind" button), reading/rendering the narration backlog (a "history log" or "scrollback" panel), deciding how much can be undone after a save/load, or tuning how coarse/fine-grained "going back" feels (line-by-line vs paragraph-by-paragraph).

## Mental model

Every time narration advances one **step**, Pixi'VN records that moment so the player can later go
back to it. `stepHistory` is the module/singleton that manages these recorded steps: going back to
an earlier one, and reading back what was shown at each one (for a backlog/scrollback UI). The
manager instance is the named export `stepHistory` (re-exported at the package root, so
`import { stepHistory } from "@drincs/pixi-vn"` works; also reachable as `.history` on the package's
default export object).

## Checkpoints and `goBackMode`

Not every step is necessarily something the player can go back to on its own — that depends on
`stepHistory.goBackMode` (type `HistoryGoBackModeType = "step" | "paragraph"`, default `"step"`):

- **`"step"`** (default): every single step can be gone back to individually. Matches classic
  VN-style "click to undo one line" behavior.
- **`"paragraph"`**: only a step that starts a new paragraph (a `call`/`jump` happened, or a called
  label returned), proposes choices, or requires input can be gone back to on its own — everything
  else replays together with the next such step. Consequence: calling `back()` from anywhere inside
  paragraph N jumps all the way to the **start** of paragraph N-1, not to "one line up" — the whole
  of paragraph N-1 gets replayed. Step 0 is always a valid target regardless of mode.

Set it directly on the manager:

```ts
import { stepHistory } from "@drincs/pixi-vn";

stepHistory.goBackMode = "paragraph"; // or "step" (default)
```

## Going back

Trigger "go back" from game/UI code with `stepHistory.back(props)`:

```ts
import { stepHistory } from "@drincs/pixi-vn";

// In a click handler for a "back" / "undo" button:
await stepHistory.back(props); // props: the StepLabelPropsType passed into your step/label functions
// go back 3 steps (or 3 checkpoints, in "paragraph" mode) at once:
await stepHistory.back(props, { steps: 3 });
```

This is also how Pixi'VN itself handles the player pressing a system/browser "back" gesture, and
`Game.addOnError` examples show calling `await stepHistory.back(props)` inside an error handler to
roll back to the previous step on failure.

Notes on `back()`:

- `steps` must be a finite number `> 0`; anything else logs a warning and does nothing.
- If narration is mid-step, or another `back()`/`continue()` is already in flight, the request is
  queued automatically rather than executed immediately — safe to call from an event handler
  without extra guarding.
- Use `stepHistory.canGoBack` (boolean) to decide whether to show/enable a "go back" button. In
  `"step"` mode this is `true` as soon as there's at least one earlier step to return to; in
  `"paragraph"` mode it becomes `true` less often, since most steps aren't individually go-back-able.
- `stepHistory.blockGoBack()` disables `back()` from this point on, permanently (only takes effect
  when no step is currently running) — useful right after an irreversible action (e.g. a choice
  with real consequences) if the player shouldn't be able to rewind past it.

## Reading step/narration history (for a backlog UI)

In Pixi'VN's own terminology, "**narrative history**" is the list of all dialogues, choices, etc. that have been shown to the player — that's what these getters expose:

- `stepHistory.narrativeHistory: NarrationHistory[]` — every recorded step across the whole playthrough, in order, each with `dialogue`, `choices`, `playerMadeChoice`, `inputValue`, `stepIndex`, `openedLabelsNumber`. This is the property the official docs' "Get" section shows:
  ```ts
  import { stepHistory } from "@drincs/pixi-vn";
  const dialogues: NarrationHistory[] = stepHistory.narrativeHistory;
  ```
  (The public docs page's code sample types this as `NarrativeHistory[]` — that type isn't actually exported; the real export from `@drincs/pixi-vn` is `NarrationHistory`, confirmed in `src/narration/interfaces/NarrationHistory.ts` and used as the return type in `src/history/HistoryManager.ts`. Trust the source/this skill's `NarrationHistory` naming over that docs typo.)
- `stepHistory.currentLabelHistory: NarrationHistory[]` — just the "current page": steps belonging to the current label and its child labels, reset every time `narration.jump` is used. Useful for a per-scene backlog.
- `stepHistory.currentPageParagraphs: NarrationHistory[][]` — `currentLabelHistory` grouped into paragraphs (a new paragraph starts whenever `openedLabelsNumber` changes), regardless of `goBackMode`.
- `stepHistory.removeNarrativeHistory(itemsNumber?)` — deletes all narrative history if called with no argument, or trims just the oldest `itemsNumber` entries if you pass a number:
  ```ts
  stepHistory.removeNarrativeHistory(); // delete everything
  stepHistory.removeNarrativeHistory(2); // delete the first 2 elements
  ```

## Save/load and step limits

- `stepHistory.stepLimitSaved` (default `20`) caps how many steps' worth of go-back history are kept when exporting for a save file (consumed by `Game.exportGameState()` — see `pixi-vn-saves`). Older steps beyond that limit are dropped from what's exported — meaning after loading a save, the player can only go back up to `stepLimitSaved` steps, even though `narrativeHistory` itself may show more (older entries lose the ability to be "gone back to" but keep their display text — the docs put it as "only essential information from older steps is kept"). Set it to `Infinity` to disable the limit and keep everything go-back-able.
- `stepHistory.clear()` wipes all history (called by `Game.clear()` and at the start of `Game.restoreGameState()`).

## Real-world usage (official React template)

The official "TS narration + React" template (what `npm create pixi-vn@latest` scaffolds, source at `pixi-vn-react-template`) shows one concrete way to wire up "go back" and a backlog UI. This is **that template's convention, not a library requirement** — the APIs below (`canGoBack`, `back()`, `narrativeHistory`) are all you actually need; the loading-state/React-Query/i18n wrapping around them is the template's own app architecture.

**Guarding the "back" button/gesture** — `src/lib/query/narration-query.ts` exposes `stepHistory.canGoBack` through a React Query hook so the UI can enable/disable a back button reactively:

```ts
export function useQueryCanGoBack() {
  return useQuery({
    queryKey: [NARRATION_DATA_USE_QUERY_KEY, "can_go_back_use_query_key"],
    queryFn: async () => stepHistory.canGoBack,
  });
}
```

**Triggering `back()`** — `src/lib/hooks/narration-hooks.ts` wraps the call in a loading-state guard and error handling, then invalidates cached interface data (dialogue/choices/etc. queries) once it settles:

```ts
const goBack = useCallback(async () => {
  if (hasOpenMenu) return;
  GameStatus.setLoading(true);
  return stepHistory
    .back(gameProps) // gameProps: the app's StepLabelProps-shaped object from useGameProps()
    .then(() => {
      GameStatus.setLoading(false);
      gameProps.invalidateInterfaceData();
    })
    .catch((e) => {
      GameStatus.setLoading(false);
      console.error(e);
    });
}, [gameProps, hasOpenMenu]);
```

The same `stepHistory.back` is also bound directly as a handler elsewhere (`src/lib/hooks/quick-tools-hooks.ts`), e.g. `stepHistory.back.bind(stepHistory)` fired on a scroll-down gesture in a "quick tools" wheel — confirming `back(props)` is safe to call straight from arbitrary UI event handlers, not just a dedicated button.

**Backlog/history-log UI** — `src/lib/query/narration-query.ts`'s `useQueryNarrativeHistory({ searchString })` maps `stepHistory.narrativeHistory` into a flat display model per step (translating character name/dialogue text, passing through `choices` and `inputValue` as-is), then filters by a search string against character name and text:

```ts
const dialogues = stepHistory.narrativeHistory.map((step) => ({
  character: /* step.dialogue?.character name, translated */,
  text: /* step.dialogue?.text, translated */,
  icon: /* character icon, if any */,
  choices: step.choices,
  inputValue: step.inputValue,
}));
```

This is the shape a backlog/scrollback panel typically wants: one row per narrative-history entry with speaker, line, any choices offered, and any input the player typed at that step.

## Gotchas

- **Canvas is optional.** If `Game.init()` was called without a canvas element (headless/engine-only usage), canvas state is never captured or restored during `back()` — going back only affects storage, sound, path and narration position in that setup.
- **`"paragraph"` mode replays, it doesn't rewind precisely.** `back()` in `"paragraph"` mode always lands on the _start_ of the previous paragraph/checkpoint, undoing everything since then in one jump — there is no way to undo "just the last line" within a paragraph.
- **There is no "redo" after `back()`.** Going back to an earlier step discards every step recorded after the point you land on, rather than merely skipping past them — so there's nothing to go forward to again.
- **`stepHistory.get(stepIndex)` can return `undefined`** even for a valid, recorded step index if that step carried no dialogue/choices/input worth showing (an internal bookkeeping-only entry) — check for `undefined` rather than assuming every index in range has a step to render.
- **If restoring a step fails** (e.g. corrupted or incompatible save data), `back()` logs an error and leaves the game state unchanged rather than throwing.

## Related skills

pixi-vn-getting-started, pixi-vn-saves, pixi-vn-narration, pixi-vn-canvas, pixi-vn-storage
