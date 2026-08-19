---
name: pixi-vn-minigames
description: Use when adding a minigame (snake, quiz, puzzle, timing/reaction game, ...) to a Pixi'VN visual novel — the `useMinigame` lifecycle hook pattern, using PixiJS directly on its own layer instead of `gameLayer`, hotkeys for controls, linking the minigame to a route, and why saving/restoring minigame state is the developer's own responsibility.
---

# Pixi'VN Minigames

Official docs: [pixi-vn.com/start/minigames](https://pixi-vn.com/start/minigames).

Pixi'VN has no dedicated minigame API — a minigame is just PixiJS code (and, for its HUD/UI, a
regular framework UI) wired into the game through the same primitives used elsewhere: canvas
layers, hotkeys, and navigation. This skill is about how those pieces fit together for a minigame
specifically, not about introducing new APIs.

## When to use this skill

Load this skill whenever a task involves building or wiring in a minigame: a snake/arcade-style
game, a timing/reaction challenge, a puzzle, a quiz mini-mode, or anything else the player breaks
away from the main narration to play. Not for the narrative canvas itself (`pixi-vn-canvas`) or for
general app UI screens unrelated to a minigame (`pixi-vn-ui`).

## Core mental model

- **A minigame renders on its own PixiJS layer, not on `canvas.gameLayer`.** `gameLayer` is the
  save-able narrative scene graph (backgrounds, characters — see `pixi-vn-canvas`); a minigame's
  moving pieces (snake segments, falling blocks, ...) are transient and don't belong there. Use
  `canvas.addLayer(name, new Container())` to get a separate, non-save-able layer for the minigame,
  exactly like a PixiJS UI layer (`pixi-vn-ui`) — the official template even reserves a constant for
  it, `CANVAS_MINIGAME_LAYER_NAME`.
- **The minigame's HUD/menus (score, game-over overlay, control buttons) should be regular UI**, not
  PixiJS — built with React/Vue/whatever the project's UI already uses (`pixi-vn-ui`), positioned
  over the canvas the same way any other UI is.
- **A minigame is launched from the narrative, then the player returns to it.** The recommended
  approach is to link the minigame to its own route (e.g. `/minigame/snake`) and navigate to it from
  a step, then navigate back when it ends — see `pixi-vn-ui`'s "Navigating between UI screens"
  section and [interface-navigate](https://pixi-vn.com/start/interface-navigate). Every minigame
  example below is written as a route file for this reason, not a bare component.
- **Saving and restoring the minigame's current state (score, board, position, ...) is entirely the
  developer's responsibility.** `Game.exportGameState()` does not know about a minigame in progress
  — see `pixi-vn-saves`. If a minigame's progress must survive a save/reload, persist it yourself
  (e.g. via [game storage](https://pixi-vn.com/start/storage), see `pixi-vn-storage`).

## Routing structure: one route per minigame, plus a shared layout route

With file-based routing (e.g. [TanStack Router](https://tanstack.com/router/latest), used by the
official templates), each minigame gets its own file under `src/routes/minigame/`, so a project with
several minigames ends up with `/minigame/snake`, `/minigame/quiz`, etc.:

```tsx title="src/routes/minigame/snake.tsx"
import { createFileRoute } from "@tanstack/react-router";
import SnakeGame from "@/screens/minigames/SnakeGame";

export const Route = createFileRoute("/minigame/snake")({
  component: SnakeGame,
});
```

Anything shared by _every_ minigame (pausing narration/audio while one is open, common hotkeys, a
shared HUD wrapper) doesn't belong copy-pasted into each of those files. Factor it into a single
pathless layout route, `src/routes/minigame.tsx`, that renders an `<Outlet />` for whichever
minigame route is active — the same pattern the official React template already uses for `/game`
(`src/routes/game.tsx` wraps every `/game/*` screen with `usePauseGameWhenMenuIsOpen` +
`useGameHotkeys` + `<Outlet />`):

```tsx title="src/routes/minigame.tsx"
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/minigame")({
  component: MinigameLayout,
});

function MinigameLayout() {
  // hooks/providers shared by every minigame go here
  return <Outlet />;
}
```

**What actually goes in `src/routes/minigame.tsx` is a judgment call to make while building the
_first_ minigame, not a file to scaffold reflexively** — work through these questions before adding
anything to it:

- **Is there actually anything shared across minigames?** If the game's settings menu, pause menu,
  or quick-actions wheel aren't reachable while a minigame is open, and there's no common
  hotkey/HUD/provider every minigame needs, `src/routes/minigame.tsx` has nothing to do — leave it
  empty (just the `<Outlet />`) or skip creating it at all and let each minigame route stand alone.
- **Are there menus specific to minigames only** (a minigame pause menu, a "quit minigame and return
  to story" confirmation, a minigame-specific settings panel)? If so, that's exactly what belongs in
  the shared layout, the same way `src/routes/game.tsx` centralizes `usePauseGameWhenMenuIsOpen` and
  `useGameHotkeys` for every `/game/*` screen.
- **Should the same menus as `src/routes/game.tsx` (settings, save/load, quick actions) be reachable
  from inside a minigame?** If yes, don't assume they behave identically — check case by case whether
  each one still makes sense mid-minigame. Saving is the clearest example: `Game.exportGameState()`
  knows nothing about in-progress minigame state (see the Gotchas section below), so a save
  triggered from inside a minigame either needs to be disabled/hidden there, or the minigame needs to
  persist its own state first (`pixi-vn-storage`) so the save is still meaningful. Don't wire in the
  game's menus unchanged and assume they "just work" inside a minigame.

## The `useMinigame` lifecycle hook

Every official template ships a `useMinigame` hook (e.g. `src/lib/hooks/minigame-hooks.ts`) that
handles the repetitive part of wiring a minigame into a layer: creating the layer once, running an
optional async `onStart` before the game begins, calling back into your `game(layer)` function, and
cleaning the layer up (plus your `onExit`) when the screen unmounts.

```ts title="lib/hooks/minigame-hooks.ts (React)"
import { CANVAS_MINIGAME_LAYER_NAME } from "@/constants";
import { canvas, type Layer } from "@drincs/pixi-vn";
import { Container } from "pixi.js";
import { useEffect, useRef } from "react";

export function useMinigame(
  game: (layer: Layer) => void,
  props?: {
    onStart?: () => Promise<void>;
    onExit?: (layer: Layer) => void;
  },
) {
  const loading = useRef(false);

  useEffect(() => {
    loading.current = true;
    const layer = canvas.addLayer(CANVAS_MINIGAME_LAYER_NAME, new Container());
    if (!layer) {
      console.error("Failed to create UI layer for minigame");
      return;
    }

    let cancelled = false;
    (props?.onStart ?? (async () => {}))().then(() => {
      if (cancelled) return;
      loading.current = false;
      game(layer);
    });

    return () => {
      cancelled = true;
      canvas.removeLayer(CANVAS_MINIGAME_LAYER_NAME);
      props?.onExit?.(layer);
    };
  }, [game]);

  return { loading };
}
```

Usage inside the minigame's own route file:

```tsx title="src/routes/minigame/example.tsx"
import { Layer } from "@drincs/pixi-vn";
import { Graphics, Ticker } from "@drincs/pixi-vn/pixi.js";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import useMinigame from "@/lib/hooks/minigame-hooks";

export const Route = createFileRoute("/minigame/example")({
  component: MiniGame,
});

function MiniGame() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const ticker = useMemo(() => {
    const ticker = new Ticker();
    ticker.add(({ deltaMS }) => {
      // update game logic; call setGameOver(true) + ticker.stop() to end
    });
    return ticker;
  }, []);

  useHotkey(
    "ArrowUp",
    () => {
      /* handle input */
    },
    { enabled: !gameOver },
  );

  const game = useCallback(
    (layer: Layer) => {
      ticker.start();
    },
    [ticker], // must NOT change during the game or it restarts
  );

  const options = useMemo(
    () => ({
      onExit() {
        ticker.stop();
        ticker.destroy();
      },
    }),
    [ticker], // must NOT change during the game or it restarts
  );

  useMinigame(game, options);

  return (
    <>{/* score HUD, game-over overlay, control buttons — regular UI */}</>
  );
}
```

- **`game(layer)`** is where you build the actual PixiJS content (`Graphics`, `Sprite`, `Text`, a
  `Ticker`) and add it to the given `layer`. It runs once, after `onStart` resolves.
- **`onExit(layer)`** is where you tear down anything `game` started — stop and `destroy()` any
  `Ticker`, remove event listeners. `useMinigame` already removes the layer itself.
- **`game` and the `options` object (specifically its `onExit`) must keep a stable identity** across
  re-renders (`useCallback`/`useMemo` with the right deps) — since they're the effect's dependency,
  changing identity mid-game tears down and restarts the whole minigame.

## Controls and rendering

- Use **hotkeys** for keyboard input (see `pixi-vn-ui`/[hotkeys](https://pixi-vn.com/start/hotkeys))
  rather than raw `window.addEventListener("keydown", ...)`, and gate them with `enabled: !gameOver`
  so input stops mounting a listener that outlives the round.
- Build the actual gameplay visuals with PixiJS directly — either the `pixi.js` package or the
  `@drincs/pixi-vn/pixi.js` re-export — using `Graphics`/`Sprite`/`Text` and a `Ticker` for the game
  loop, same primitives as `pixi-vn-canvas` but on the dedicated minigame layer instead of
  `gameLayer`.
- On-screen touch controls, score displays, and game-over messages should still be plain UI
  components (buttons, divs) layered over the canvas with `pointerEvents: "auto"` where they need to
  be clickable — see `pixi-vn-ui`'s "Enabling interaction" section.

## Gotchas

- **Adding game content to `canvas.gameLayer` instead of a dedicated layer** makes it save-able and
  mixes it with narrative elements — use `canvas.addLayer` for the minigame instead (`pixi-vn-canvas`
  has the full `gameLayer` vs. layer distinction).
- **An unstable `game`/`onExit` reference restarts the minigame on every render** — see the
  `useCallback`/`useMemo` note above; this is the single most common bug when porting the pattern.
- **Nothing about minigame progress is captured by `Game.exportGameState()`** — a mid-round save/
  reload will silently drop it unless you persist state yourself through game storage
  (`pixi-vn-storage`/`pixi-vn-saves`).
- **Forgetting to stop/destroy the `Ticker` in `onExit`** leaves the game loop running (and
  potentially erroring against removed objects) after the player navigates away.

## Related skills

- pixi-vn-canvas: the PixiJS rendering primitives (`Graphics`, `Sprite`, `Text`, tickers,
  `canvas.animate`) a minigame is built from, and the `gameLayer`/layer distinction.
- pixi-vn-ui: `canvas.addLayer`/`addHtmlLayer`, hotkeys, and navigating between UI screens/routes —
  how the minigame's HUD and route linkage actually work.
- pixi-vn-storage: persisting minigame progress (score, board state) in game storage if it needs to
  survive a save/reload.
- pixi-vn-saves: confirms `Game.exportGameState()` has no built-in notion of in-progress minigame
  state.
