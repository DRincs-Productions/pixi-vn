# Developing Pixi'VN

This file is for anyone (human or AI agent) making changes to the `@drincs/pixi-vn` library itself —
not for a project that merely *uses* the library (that's what the `skills/` directory and
[pixi-vn.com](https://pixi-vn.com) are for).

## 1. The library must stay modular and generic

Pixi'VN is a general-purpose engine, not a specific game. Every module under `src/` (`canvas`,
`narration`, `sound`, `storage`, `history`, `characters`, `worker`, ...) must keep working:

- **Independently of the others where possible.** `Game.init()` with no arguments must still work
  headless (storage/narration/history, no canvas) — don't make a module silently assume another one
  has been initialized unless that's its documented job.
- **Independently of any specific game's content.** Nothing in `src/` should hardcode a label id,
  asset alias, character name, or UI convention that only makes sense for one project. Anything that
  looks like "my game's logic" belongs in the sandbox (§3) or a template, never in `src/`.
- **Independently of a specific bundler/framework where feasible.** Bundler-specific integrations
  (e.g. `src/vite/`) are opt-in extras layered on top of a core that itself does not require Vite,
  React, or any particular tool. `pixi.js`, `pixi-filters`, `tone`, `motion`, `@pixi/devtools`, and
  `vite` are peer dependencies for this reason — see `skills/game-init/SKILL.md`.
- **Every public symbol is exported through an `index.ts`** (root `src/index.ts` plus the per-module
  subpath entry points, e.g. `src/narration/index.ts`) — see `CONTRIBUTING.md`'s folder list
  (`managers`/`functions`/`classes`/`decorators`/`interface`/`types`/`labels`). Adding a feature
  without wiring it through the right `index.ts` makes it unreachable from `@drincs/pixi-vn` and its
  subpaths.

Before adding an abstraction, ask whether it's genuinely reusable across arbitrary Pixi'VN projects.
If it only serves one narrow use case, it likely doesn't belong in `src/`.

**Use path aliases for new imports, not parent-relative paths.** In new files, and for any new import
line added to an existing file, prefer `@canvas/...`, `@motion/...`, `@utils/...`, `@classes/...`, etc.
(see `tsconfig.json`'s `paths`) over `../` / `../../` traversal. Same-directory imports (`./sibling`)
are fine as-is. This is a forward-looking convention, not a mandate to rewrite existing relative
imports you happen to be near — leave a file's pre-existing imports alone unless you're already
rewriting that exact line for another reason.

## 2. Testing policy

**If it can be tested with Vitest, it must be tested with Vitest.** This covers the large majority of
the codebase: managers, decorators, storage/history logic, narration flow and branching, diffing,
save/restore, error handling, the Vite plugins, etc. Tests live in `tests/*.test.ts` and run with:

```bash
npm test          # vitest
```

`vitest.config.ts` runs tests under `jsdom` with `tests/setup.ts` / `tests/webaudio-setup.ts`, so DOM
and Web Audio APIs are available without a real browser — most modules, including a good part of
`canvas`/`sound`, are already covered this way (see `tests/canvas-manager.test.ts`,
`tests/sound.test.ts`, `tests/game-testing.test.ts`, etc. for the existing patterns to follow). Adding
a feature or fixing a bug without a Vitest test to cover it is incomplete work unless the thing being
changed genuinely cannot be observed outside a real browser (§3).

## 3. What Vitest can't cover: the sandbox

Some things can't be meaningfully verified under `jsdom` — real PixiJS rendering/animation timing,
actual audio playback, real browser ticker/RAF behavior, visual layout. For those:

1. **Add a test label** under [sandbox/src/labels/](sandbox/src/labels/) that exercises the feature.
   Use `registerTestLabel(id, title, steps)` from
   [sandbox/src/labels/registry.ts](sandbox/src/labels/registry.ts) (a thin wrapper around `newLabel`)
   and import the new file from [sandbox/src/labels/index.ts](sandbox/src/labels/index.ts) — it then
   automatically shows up as a choice in the sandbox's start menu. See
   [sandbox/src/labels/canvas-text-example.ts](sandbox/src/labels/canvas-text-example.ts) as a
   template.

2. **Run the sandbox:**

   ```bash
   npm run sandbox   # builds the library, syncs dist/ into sandbox/node_modules, starts the CRA dev server
   ```

3. **Open the browser** at the printed URL (default `http://localhost:3000`). The sandbox boots
   straight into the start menu label, which lists every registered test label as a choice.
   **If the Chrome DevTools MCP server is available, use it** to drive this step yourself
   (`new_page`/`navigate_page`, `click`/`take_snapshot` to click through labels and the
   `Continue`/`Indietro` controls, `take_screenshot` to actually look at the canvas, and
   `list_console_messages` to check for errors/warnings after each step) instead of only asking the
   human to click around — it has already caught real bugs (e.g. a PixiJS deprecation warning) that a
   headless Playwright script missed because it wasn't checking console output as closely. Fall back
   to a Playwright/`chromium-cli` script, or asking the human to drive the browser, only when Chrome
   DevTools MCP isn't available.
4. **Drive/inspect it through `Game.testing`** (exposed on `window.pixiVN` in the sandbox — enabled
   automatically for non-production builds, see `sandbox/src/index.tsx`) instead of clicking blindly:
   read `window.pixiVN.getState()` to see the current dialogue/choices, `selectChoice(i)` to enter a
   test label, and inspect `window.pixiVN.canvas` / `.sound` / `.storage` / `.Game` for state that
   isn't visible as text. Follow the full API and cookbook in the `pixi-vn-testing` skill
   (`skills/testing/SKILL.md`) — the same bridge a real game's devtools use.
5. **Look at the canvas directly** for anything that's fundamentally visual (does the sprite render at
   the right position, does the transition look right, does the animation run smoothly) — `Game.testing`
   tells you *what state the engine thinks it's in*, not what it looks like on screen.

The sandbox is a scratchpad for exercising engine internals, not a game. Its React console is only
for test control; labels remain responsible for exercising the engine behavior. Browser-driven
scripts can use `window.pixiVN`, while a human can use the same actions through the console.

The sandbox currently includes a small React testing console in `sandbox/src/App.tsx`. It lists
registered test labels and provides controls for starting a label, continuing, going back, closing
the current label, and selecting open choices. The console uses the same `Game.testing` bridge as
browser-driven tests; `window.pixiVN.canvas` and `window.pixiVN.sound` are also exposed in dev
mode so visual and audio state can be inspected directly. Keep the console focused on test control,
not game UI.

Keep sandbox test labels small and focused on one feature each — they're throwaway verification
tools, not sample content. It's fine (and expected) for `sandbox/src/labels/` to accumulate one file
per feature under active development; delete a test label once the feature it covers is stable and
adequately covered elsewhere (Vitest, or another still-relevant test label).

## Related docs

- `CONTRIBUTING.md` — project folder structure, issue/PR process.
- `skills/` — one skill per module, written for consumers of the library; still the best reference
  for what each module's public API is supposed to do.
- `skills/testing/SKILL.md` — the full `Game.testing` API (this is what step 4 above uses).
