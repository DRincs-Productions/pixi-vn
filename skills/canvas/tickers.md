# Pixi'VN Canvas: manual tickers (advanced)

Part of the `pixi-vn-canvas` skill — read `SKILL.md` first. This file covers **manual, low-level
ticker management**: registering a continuous/looping `Ticker` yourself and controlling it directly.
Reach for this only when `canvas.animate`, the transition helpers, or `shakeEffect` (covered in
`SKILL.md`) don't fit — e.g. an indefinitely-looping effect with no fixed duration, or fine-grained
pause/resume/completion control over a specific running animation.

Docs: [pixi-vn.com/start/canvas-tickers](https://pixi-vn.com/start/canvas-tickers).

## Registering a ticker

For continuous/looping effects (e.g. a custom rotation), register a `Ticker` class and attach it
to an alias:

```ts
canvas.addTicker("alien", new RotateTicker({ speed: 0.2 }));
```

## Sequencing tickers

To chain multiple tickers one after another on the same alias, use `addTickersSequence` with a
plain array of `Ticker` instances — each step starts once the previous one completes:

```ts
canvas.addTickersSequence("alien", [
  new RotateTicker({ speed: 0.1, clockwise: true }, 2), // runs for 2 seconds
  new RotateTicker({ speed: 0.2, clockwise: false }, 2),
]);
```

## Pausing, resuming, removing, and completion

Use `canvas.pauseTicker(...)` / `canvas.resumeTicker(...)` to pause/resume by canvas alias or
ticker id, and `canvas.removeTicker(id)` / `canvas.removeAllTickers()` to stop them. If a
goal-directed ticker (e.g. a `MoveTicker` with a destination) must finish before the current step
ends — rather than being interrupted by the player advancing — call
`canvas.completeTickerOnStepEnd({ id })`; this is distinct from the `completeOnContinue` transition
prop covered in `SKILL.md`.

Note also (from `SKILL.md`'s gotchas): `canvas.remove(alias)` removes tickers bound only to that
alias by default — pass `{ ignoreTickers: true }` if you intend to reattach them elsewhere first.

## Writing a custom `Ticker` subclass

Out of scope for a quick reference — see the `tickers` exports (`TickerBase`, `tickerDecorator`,
`RegisteredTickers`) in `@drincs/pixi-vn` if a project needs a genuinely new ticker type rather than
composing the built-in presets.
