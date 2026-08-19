---
name: pixi-vn-canvas
description: Use when adding, moving, or removing images, sprites, text, or video on the Pixi'VN game canvas, or when applying transitions (dissolve, fade, move, zoom, push), shake/animation effects, or ticker-based animations built on PixiJS. Covers the `canvas` singleton exported from `@drincs/pixi-vn`. For UI layers (HTML or PixiJS) mounted on top of the canvas, see `pixi-vn-ui` instead.
---

# Pixi'VN Canvas

The Canvas module is Pixi'VN's 2D scene graph, built directly on top of PixiJS. It manages
everything that is visually rendered in the game: background images, character sprites, text,
video, and the transitions/animations between them. Official docs:
[pixi-vn.com/start/canvas](https://pixi-vn.com/start/canvas).

Every symbol used below (`canvas`, `showImage`, `Sprite`, transition helpers, etc.) is exported
from the main package entry point:

```ts
import { canvas } from "@drincs/pixi-vn";
```

(Also available from the narrower `@drincs/pixi-vn/canvas` subpath — see `pixi-vn-getting-started` for when to prefer that.)

## When to use this skill

Load this skill whenever a task involves:

- Showing, replacing, or removing an image/sprite/video/text on screen.
- Building a composite character sprite out of several image layers.
- Applying a transition (dissolve, fade, move, zoom, push) when a background or sprite changes.
- Adding a shake effect or a custom PixiJS-ticker-driven animation.
- Reading or modifying canvas element position/anchor/alpha/zIndex.

For building/mounting UI layers (HTML or PixiJS) on top of the canvas, use `pixi-vn-ui` instead —
this skill is about the `gameLayer` save-able scene graph, not UI chrome.

For dialogue/character-portrait logic use `pixi-vn-characters` and `pixi-vn-narration` instead;
this skill is about the underlying rendering primitives.

## Core mental model

- **`canvas`** (from `@drincs/pixi-vn`) is the single entry-point object developers use. It wraps
  a PixiJS `Application` and exposes methods to manage canvas elements, tickers (frame-by-frame
  animation), and layers. Call `await canvas.init(element, options)` once at startup (this is
  normally done for you by `Game.init(...)` from the core package — see `pixi-vn-getting-started`).
- **Elements are tracked by alias, not by variable** ([docs](https://pixi-vn.com/start/canvas-alias)).
  `canvas.add(alias, component)` inserts a component (an instance of `Container`, `Sprite`,
  `ImageSprite`, `ImageContainer`, `Text`, or `VideoSprite`) into `canvas.gameLayer` (a single
  PixiJS `Container` that holds all "in-scene" elements) and sets `component.label = alias`. Use
  `canvas.find<T>(alias)` to look elements back up and `canvas.remove(alias)` to remove them.
  Aliases are also how Pixi'VN saves/restores canvas state (see `pixi-vn-storage`), so prefer the
  alias-based helpers below over holding onto raw object references across steps.
- **Every element class is a save-able extension of a PixiJS class**: `Container` extends
  `PIXI.Container`, `Sprite`/`ImageSprite`/`VideoSprite` extend `PIXI.Sprite`, `Text` extends
  `PIXI.Text`. They add a `.memory` getter / `.setMemory()` for serialization, plus convenience
  properties (`anchor`, `align`, `percentagePosition`, `xAlign`/`yAlign`, `percentageX`/`percentageY`)
  as alternative ways to position an element without doing pixel math.
- **`Layer`** is just a type alias for a plain `PIXI.Container<ContainerChild>` — there's no
  special Layer class. A separate, non-save-able PixiJS Container can be attached directly to the
  stage as a sibling of `gameLayer` (`canvas.addLayer`/`getLayer`/`removeLayer`) — see `pixi-vn-ui`
  for that API, it's how UI layers (HTML or PixiJS) are built on top of the canvas.
- **Tickers** are how frame-based animation and effects work under the hood; `canvas.animate(...)`
  (built on the `motion` library) is the high-level way to animate numeric properties over time,
  and it is what all the built-in transition helpers use internally.

## Showing and removing an image

```ts
import { canvas, addImage, showImage } from "@drincs/pixi-vn";

// addImage() creates + registers the sprite but does NOT load/display the texture yet
const bunny1 = addImage("bunny1"); // "bunny1" is an alias registered in the assets manifest
await bunny1.load();

// showImage() is addImage() + load() in one call
const bunny2 = await showImage("bunny2");
bunny2.anchor = 0.5;
bunny2.x = canvas.width / 2;
bunny2.y = canvas.height / 2;

// remove it later by alias
canvas.remove("bunny1");
```

Always pass a manifest **alias** (as above), not a raw URL/path — see `pixi-vn-assets` for how
assets get registered (local vs. online) and loaded. `addImage`/`showImage` do also accept a raw
URL as a second argument for quick prototyping, but that couples code to a specific file location;
`addImage`/`showImage` throw a `PixiError` if neither a URL nor a registered alias resolves. Both
return an `ImageSprite`.

For a composite image made of multiple stacked textures (e.g. a character body + outfit + face),
use `ImageContainer` via `addImageCointainer` / `showImageContainer` (note the exported spelling
"Cointainer"):

```ts
import { showImageContainer } from "@drincs/pixi-vn";

const liam = await showImageContainer("liam", ["liam-body", "liam-head"]);
```

## Adding text

```ts
import { showText } from "@drincs/pixi-vn";

showText("score-label", "Score: 0", {
  fontSize: 24,
  fill: "white",
  x: 20,
  y: 20,
});
```

`showText(alias, text, options)` creates/replaces a `Text` element (extends `PIXI.Text`) and adds
it to the canvas immediately. `options` is `TextOptions` (PixiJS `CanvasTextOptions` plus the
`align`/`percentagePosition` positioning extensions), so `style`, `fontSize`, `fill`, `x`/`y`, etc.
all work as in plain PixiJS.

## Playing a video

```ts
import { showVideo } from "@drincs/pixi-vn";

const film = await showVideo("intro-film"); // "intro-film" resolves via the assets manifest
film.loop = true;
// film.pause(), film.play(), film.restart(), film.currentTime = 2
```

`addVideo`/`showVideo` mirror `addImage`/`showImage` and return a `VideoSprite` (extends
`ImageSprite`). Files are also recognized as videos by extension automatically anywhere a
transition helper accepts an image URL (`.mp4`, `.webm`, `.mov`, etc. — see `checkIfVideo`).

## Transitions

Docs: [pixi-vn.com/start/canvas-transition](https://pixi-vn.com/start/canvas-transition).

All transition helpers take `(alias, componentOrUrl?, props?, priority?)`. If you omit the
component/URL argument, the `alias` itself is used as the texture URL/alias. Each function
replaces (or removes) whatever is currently registered under `alias`, transferring position and
running tickers from the old element automatically. They all return a `Promise` (or array) of
ticker ids you can pass to `canvas.forceCompletionOfTicker` if you need to await completion, but
usually you just call and move on.

```ts
import {
  showWithDissolve,
  removeWithDissolve, // fade the new image in / fade the current one out
  showWithFade,
  removeWithFade, // cross-fade old -> new (falls back to dissolve if none exists)
  moveIn,
  moveOut, // slide in/out from a screen edge
  zoomIn,
  zoomOut, // scale in/out from a screen edge
  pushIn,
  pushOut, // new image pushes the old one off-screen
} from "@drincs/pixi-vn";

// change background with a 1s dissolve ("bg-forest" is a manifest alias)
await showWithDissolve("background", "bg-forest", { duration: 1 });

// slide a character sprite in from the left
await moveIn("liam", "liam-neutral", { direction: "left", duration: 0.5 });

// remove a character with a zoom-out toward the right edge
zoomOut("liam", { direction: "right", duration: 0.5 });
```

`props` extends `AnimationOptions` from `motion` (e.g. `duration`, `ease`) plus a
`completeOnContinue` flag (default `true`) that finishes the transition immediately when the
player advances the narration before the animation ends — leave this at its default unless you
specifically want an animation to be interruptible/ignored.

## Shake and custom animation

`shakeEffect` is an "articulated animation" — a helper built on top of `canvas.animate`
(docs: [canvas-articulated-animations-effects](https://pixi-vn.com/start/canvas-articulated-animations-effects),
[canvas-motion](https://pixi-vn.com/start/canvas-motion)):

```ts
import { shakeEffect, canvas } from "@drincs/pixi-vn";

// shake a canvas element horizontally
await shakeEffect("screen-flash-target", {
  shakeType: "horizontal",
  maxShockSize: 15,
  shocksNumber: 10,
});

// low-level: animate arbitrary numeric properties with motion-style keyframes
canvas.animate("liam", { alpha: [0, 1], y: [50, 0] }, { duration: 0.8 });
```

`canvas.animate(componentOrAlias, keyframes, options, priority)` is the primitive all transition
helpers are built on ([motion's `animate`](https://motion.dev/docs/animate) semantics: keyframes
are arrays of target values, `options` supports `duration`, `ease`, `repeat`, etc.). Pixi'VN tracks
animation state so it can be saved/restored — this is why you should prefer `canvas.animate`
(or the transition helpers) over driving PixiJS directly with your own `requestAnimationFrame` loop.
For UI that is _not_ part of the saved scene graph (e.g. a PixiJS UI overlay), the docs recommend
importing the raw `animate` from `@drincs/pixi-vn/motion` instead — it skips the save-state
bookkeeping and is cheaper.

## Frame tickers

`canvas.animate` and the transition helpers above already use tickers internally — most tasks never
need to touch the ticker API directly. For a genuinely continuous/looping custom effect (no fixed
duration) or manual pause/resume/completion control over a running animation, see **`tickers.md`**
in this same skill folder (registering a `Ticker`, `addTickersSequence`,
`pauseTicker`/`resumeTicker`/`removeTicker`, `completeTickerOnStepEnd`). Docs:
[pixi-vn.com/start/canvas-tickers](https://pixi-vn.com/start/canvas-tickers).

## UI layers

Persistent UI chrome (HUD, menus) does **not** live on `gameLayer` — it lives on a separate,
non-save-able layer built with `canvas.addLayer`/`getLayer`/`removeLayer` (PixiJS-only UI) or
`canvas.addHtmlLayer`/`getHtmlLayer`/`removeHtmlLayer` (mounting a DOM-based UI framework like React
or Vue). That whole API, plus the official template's layer-naming conventions, `extractImage()` for
save-file thumbnails, and how to build a UI purely out of PixiJS components, is covered by
`pixi-vn-ui` — reach for that skill instead whenever the task is about UI rather than the game scene.

## Gotchas

- **`addImage`/`addVideo`/`addImageCointainer` only construct and register the element — the
  texture is not loaded/visible until you `await element.load()`.** The `show*` variants
  (`showImage`, `showVideo`, `showImageContainer`, and the transition helpers) call `load()` for
  you; prefer them unless you need to prepare an element off-screen first.
- **`getTexture`/`load()` throw a `PixiError` (`unregistered_asset`)** if the alias can't be
  resolved from the PixiJS `Assets` cache/manifest. See `pixi-vn-assets` for how to register an
  alias (local assets via AssetPack, or online assets in `src/assets/index.ts`) before referencing it here.
- **Adding an element with an alias that already exists replaces it** and — per the
  ["heredity factor"](https://pixi-vn.com/start/canvas-alias#heredity-factor) — copies over
  properties/`zIndex`/tickers from the old one by default (`canvas.add(alias, el, { ignoreOldStyle: true })`
  to opt out) — this is what lets `showImage("bg", newUrl)` "just work" as a same-alias swap.
- **`canvas.remove(alias)` also removes tickers** bound only to that alias; pass
  `{ ignoreTickers: true }` if you intend to reattach them elsewhere first.
- **Event listeners use plain PixiJS `.on(...)`, not a Pixi'VN-specific method** — a stray JSDoc
  comment in the `Sprite` source suggests `sprite.onEvent(...)`, but that method doesn't exist;
  the [official docs](https://pixi-vn.com/start/canvas-functions#add-a-listener-to-an-event) confirm
  `.on(...)` is correct. The Pixi'VN-specific part is **only** the `@eventDecorator()` requirement
  for save/load: `sprite.on("pointerdown", Events.handler)` only serializes correctly if
  `Events.handler` is a static method decorated with `@eventDecorator()` (from `@drincs/pixi-vn`);
  a plain inline arrow function will log a warning and not be restored after loading a save.
- **Positioning has multiple parallel systems** (docs: [canvas-position](https://pixi-vn.com/start/canvas-position))
  — pixel (`x`/`y`/`position`), anchor/`pivot` (where on the element itself the position point
  sits), `align`/`xAlign`/`yAlign` (Ren'Py-style percentage-of-canvas positioning, e.g. `0.5` =
  centered; per source JSDoc, **`pivot` does not affect `align`**), and
  `percentagePosition`/`percentageX`/`percentageY` (also percentage-of-parent, but **`pivot` does
  affect it**, unlike `align`). Setting `x`/`align`/`percentagePosition` on the same axis clears
  the others; check `element.positionType` / `element.positionInfo` if you need to know which mode
  is active.
- **`CANVAS_APP_GAME_LAYER_ALIAS` (`"__game_layer__"`) is reserved** — `canvas.add`, `remove`, and
  `addLayer` will refuse to use that alias.
- `canvas.pause()`/`canvas.resume()` stop/restart rendering and tickers for the whole game layer
  (e.g. when opening a menu) — remember to call `resume()` or elements will appear frozen.

## Related skills

- pixi-vn-getting-started: project setup, `Game.init()`, and how the canvas is wired up at startup.
- pixi-vn-assets: registering images/video (local or online) and choosing when their bundle loads, before referencing them here by alias.
- pixi-vn-characters: character/emotion definitions that use canvas images under the hood for portraits.
- pixi-vn-narration: dialogue/step flow, and how canvas transitions integrate with `completeOnContinue`.
- pixi-vn-storage: how canvas element state (by alias) is saved and restored across game saves.
- pixi-vn-ui: building/mounting UI layers (HTML or PixiJS) on top of the canvas — `addLayer`, `addHtmlLayer`, and building UI screens with PixiJS components.
