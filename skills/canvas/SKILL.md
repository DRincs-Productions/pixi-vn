---
name: pixi-vn-canvas
description: Use when adding, moving, or removing images, sprites, text, or video on the Pixi'VN game canvas, or when applying or creating transitions (dissolve, fade, move, zoom, push, wipe, iris, split, flash, blur, pixelate, or a custom one built on `canvas.animate`/`filters.animate`), shake/animation effects, or ticker-based animations built on PixiJS. Covers the `canvas` singleton exported from `@drincs/pixi-vn`. For UI layers (HTML or PixiJS) mounted on top of the canvas, see `pixi-vn-ui` instead.
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
- Applying a transition (dissolve, fade, move, zoom, push, wipe, iris, split, flash, blur, pixelate) when a background or sprite changes.
- Adding a shake effect or a custom PixiJS-ticker-driven animation.
- Reading or modifying canvas element position/anchor/alpha/zIndex.

For building/mounting UI layers (HTML or PixiJS) on top of the canvas, use `pixi-vn-ui` instead —
this skill is about the `gameLayer` save-able scene graph, not UI chrome.

For dialogue/character-portrait logic use `pixi-vn-characters` and `pixi-vn-narration` instead;
this skill is about the underlying rendering primitives.

## Core mental model

- **`canvas`** (from `@drincs/pixi-vn`) is the single entry-point object developers use. It wraps
  a PixiJS `Application` and exposes methods to manage canvas elements and layers. Call `await canvas.init(element, options)` once at startup (this is
  normally done for you by `Game.init(...)` from the core package — see `pixi-vn-getting-started`).
- **Elements are tracked by alias, not by variable** ([docs](https://pixi-vn.com/start/canvas-alias)).
  `canvas.add(alias, component)` inserts a component (an instance of `Container`, `Sprite`,
  `ImageSprite`, `ImageContainer`, `Text`, or `VideoSprite`) into `canvas.layers.gameLayer` (a single
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
  stage as a sibling of `gameLayer` (`canvas.layers.add`/`get`/`remove`) — see `pixi-vn-ui`
  for that API, it's how UI layers (HTML or PixiJS) are built on top of the canvas.
- **Tickers** are how frame-based animation and effects work under the hood; `canvas.animate(...)`
  (built on the `motion` library) is the high-level way to animate numeric properties over time,
  and it is what all the built-in transition helpers use internally. Running tickers are managed
  through the separate **`tickers`** singleton (also from `@drincs/pixi-vn`, not a member of
  `canvas` — the old `canvas.tickers` is a deprecated alias of it).

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
ticker ids you can pass to `tickers.forceCompletion` if you need to await completion, but
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

### Generic reveal/filter transitions: wipe, iris, split, flash, blur, pixelate, glitch, twist, warp, ripple, noiseDissolve, tv, pinch

These are only exposed through the `transitions` namespace (no flat top-level export like the
older `moveIn`/`showWithDissolve`), each as a matched `xIn`/`xOut` pair with the same
`(alias, componentOrUrl?, props?, priority?)` / `(alias, props?, priority?)` shapes as above.
They favor a handful of configurable options over narrative-specific variants — e.g. there's one
`wipeIn`, not `wipeLeft`/`wipeRight`.

```ts
import { transitions } from "@drincs/pixi-vn";

// wipe: a moving boundary reveals/conceals the image. `angle` in degrees (0 = left-to-right, 90 =
// bottom-to-top, ...); `direction` ("up"/"down"/"left"/"right") is a shorthand for the 4 cardinal angles.
await transitions.wipeIn("background", "bg-forest", { direction: "left", duration: 1 });
await transitions.wipeIn("background", "bg-night", { angle: 45, duration: 1 }); // diagonal wipe
transitions.wipeOut("background", { angle: 180, invert: true, duration: 1 });

// iris: an expanding/contracting radial mask. `origin` is normalized (0-1) to the element's own bounds.
await transitions.irisIn("liam", "liam-happy", { origin: { x: 0.5, y: 0.3 }, duration: 0.8 });
transitions.irisOut("liam", { aspect: 2, duration: 0.8 }); // aspect > 1 = wide ellipse instead of a circle

// split: two mask panels move apart/together - covers "curtain" effects without a dedicated API.
await transitions.splitIn("background", "bg-forest", { orientation: "horizontal", duration: 1 });
transitions.splitOut("background", { orientation: "vertical", origin: 0.3, duration: 1 });

// flash: a configurable color overlay (not just white) fades in/hold/out, optionally pulsing.
await transitions.flashIn("background", "bg-forest", { duration: 0.15 }); // white camera-flash reveal
transitions.flashOut("liam", { color: 0xff0033, holdDuration: 0.05, pulses: 3, duration: 0.1 }); // red damage flash

// blur / pixelate: the image is shown already blurred/pixelated and resolves into focus (or the reverse for *Out).
await transitions.blurIn("liam", "liam-happy", { strength: 40, duration: 1 });
transitions.blurOut("liam", { duration: 1 });
await transitions.pixelateIn("background", "bg-forest", { pixelSize: 48, duration: 1 });
transitions.pixelateOut("background", { duration: 1 });

// glitch: jittery slices + red/blue split, settling on *In, building up on *Out.
await transitions.glitchIn("liam", "liam-happy", { strength: 40, bursts: 3 });
// twist: unwinds out of (or winds into) a swirl - `angle` in degrees, `origin` normalized.
transitions.twistOut("liam", { angle: 540 });
// warp: radial zoom-blur streaks, like dropping out of / jumping into hyperspace.
await transitions.warpIn("background", "bg-space", { strength: 0.6 });
// ripple: fades in/out through a spreading water ring - dreams, magic, memories.
await transitions.rippleIn("liam", "liam-dream", { origin: { x: 0.5, y: 0.3 } });
// noiseDissolve: the classic VN image dissolve - organic noise blotches (`edge: "soft"` for a cloudy fade).
await transitions.noiseDissolveIn("background", "bg-night", { edge: "hard", noiseScale: 8 });
// tv: old TV switching on (dot -> glowing line -> image) / off; scales around the anchor (center it).
transitions.tvOut("liam", { lineThickness: 0.02, brightness: 3 });
// pinch: emerges from / is sucked into a point (`mode: "bulge"` puffs out instead).
transitions.pinchOut("liam", { mode: "pinch" });

// move/push also take an optional motion-blur trail (true = 40px, or a length in pixels).
await transitions.moveIn("liam", "liam-happy", { direction: "right", duration: 0.6, motionBlur: true });
```

Distortion transitions (glitch, twist, warp, ripple, pinch) move pixels around, so they read best on
images with detail - on a flat, single-color element they're much less visible.

They compose freely since each drives its own mask (`wipe`/`iris`/`split`) or filter
(`blur`/`pixelate`/`glitch`/...) independently — e.g. call `blurIn` and then `wipeIn` on the same alias to
combine both. Common narrative effects are just **recipes** built from these primitives rather than
dedicated functions: a "blink"/eyes-opening effect is a color overlay plus an iris reveal, a
"dream"/flashback is `blurIn` + `showWithFade`, a memory transition is a color overlay plus
`blurIn`, a "curtain" is a configured `splitOut`, and a diagonal wipe is just `wipeIn`/`wipeOut`
with a non-cardinal `angle`.

### Creating custom transitions

Docs: [pixi-vn.com/start/canvas-transition#custom-functionality](https://pixi-vn.com/start/canvas-transition#custom-functionality).

A custom transition is just a plain function that adds/replaces a component and drives it with
`canvas.animate` — the same primitive `showWithDissolve`, `moveIn`, etc. are built on:

```ts
import { canvas, ImageSprite, UPDATE_PRIORITY } from "@drincs/pixi-vn";
import { AnimationOptions } from "@drincs/pixi-vn/motion";

export default async function showWithDissolve(
  alias: string,
  component: ImageSprite,
  props: AnimationOptions = {},
  priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
  const { completeOnContinue = true, ...options } = props;
  canvas.add(alias, component);
  component.alpha = 0;
  const id = canvas.animate(alias, { alpha: 1 }, { ...options, completeOnContinue }, priority);
  if (component.haveEmptyTexture) await component.load();
  if (id) return [id];
}
```

If a component under the same alias may already exist, either let `canvas.add` replace it
outright (per the heredity-factor gotcha above), or explicitly swap it in first — rename the old
component's alias, add the new one, restore z-order, then transfer its properties/tickers — so an
in-flight animation on the old element carries over instead of snapping:

```ts
let oldComponentAlias: string | undefined;
const oldComponent = canvas.find(alias);
if (oldComponent) {
  oldComponentAlias = `${alias}_temp`;
  canvas.editAlias(alias, oldComponentAlias);
}
canvas.add(alias, component);
oldComponent?.parent?.setChildIndex(oldComponent, oldComponent.parent.getChildIndex(oldComponent) - 0.1);
oldComponentAlias && canvas.copyCanvasElementProperty(oldComponentAlias, alias);
oldComponentAlias && tickers.transfer(oldComponentAlias, alias, "duplicate");
```

To remove the old component only once the new one's transition finishes, pass
`aliasToRemoveAfter: oldComponentAlias` in `canvas.animate`'s `options` instead of removing it
manually. To have the old component run its own transition-out (instead of a hard cut), give it a
second `canvas.animate` call paused with `tickers.pause({ id })` and resumed via the new call's
`tickerIdToResume` option — see the wiki's own two worked examples for the exact sequencing.

**Animating a filter's own property instead of a component property** — for effects like blur,
pixelate, glow, or color grading, use `filters.animate` (from `@drincs/pixi-vn/filters`, available
since **v1.9.4**) instead of `canvas.animate`. It mirrors the same
`(alias, keyframes, options, priority)` shape with the `Filter` instance inserted as the second
argument; you attach the filter to `component.filters` yourself before animating, and detach +
destroy it in the `cleanup` callback (the 7th argument) once the animation completes — this is
exactly how `transitions.blurIn`/`blurOut`/`pixelateIn`/`pixelateOut` are implemented:

```ts
import { canvas, ImageSprite, UPDATE_PRIORITY } from "@drincs/pixi-vn";
import { filters } from "@drincs/pixi-vn/filters";
import { AnimationOptions } from "@drincs/pixi-vn/motion";

export default async function blurIn(
  alias: string,
  component: ImageSprite,
  props: AnimationOptions & { strength?: number } = {},
  priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
  const { strength = 32, completeOnContinue = true, ...options } = props;
  canvas.add(alias, component);
  const filter = new filters.BlurFilter({ strength });
  component.filters = [filter];
  const id = filters.animate(
    alias,
    filter,
    { strength: [strength, 0] },
    { ...options, completeOnContinue },
    priority,
    undefined, // apply - only needed when filter is undefined (see below)
    () => {
      component.filters = null;
      filter.destroy();
    },
  );
  if (component.haveEmptyTexture) await component.load();
  if (id) return [id];
}
```

`filters.animate` can also drive a plain numeric value with no live filter — pass `undefined` as
the filter and an `apply` callback (called every frame with the interpolated value) instead. This
is how `wipeIn`/`irisIn`/`splitIn` animate their mask geometry (a growing radius, a moving
boundary), since a mask has no filter property to write directly.

## Shake and other articulated animations

The `effects` namespace holds "articulated animations" — helpers built on top of `canvas.animate`
that bake a full keyframe array once and animate it in a single call (docs:
[canvas-articulated-animations-effects](https://pixi-vn.com/start/canvas-articulated-animations-effects),
[canvas-motion](https://pixi-vn.com/start/canvas-motion)). Like the transitions above, these are
generic primitives — the effect describes *how* a component moves, the game decides *what* that
means (a hit reaction, an idle fidget, an emphasis beat, ...).

```ts
import { effects, canvas } from "@drincs/pixi-vn";

// shake a canvas element horizontally
await effects.shakeEffect("screen-flash-target", {
  shakeType: "horizontal",
  maxShockSize: 15,
  shocksNumber: 10,
});

// bounce: one-directional decaying displacement, e.g. a character landing a jump
await effects.bounceEffect("liam", { direction: "up", distance: 30, bounces: 3 });

// pulse: decaying scale bump, e.g. emphasizing a UI element or a heartbeat
await effects.pulseEffect("liam", { scale: 1.3, pulses: 2 });

// hop: a single displacement-and-return, optionally with smaller decaying follow-up hops
await effects.hopEffect("liam", { direction: "up", distance: 40, secondaryHops: 2 });

// wiggle: decaying rotation oscillation, e.g. a "no" head-shake or a nervous tic
await effects.wiggleEffect("liam", { angle: 15, repetitions: 3 });

// nod: decaying positional oscillation along one axis, e.g. a "yes" nod or a flinch
await effects.nodEffect("liam", { axis: "vertical", distance: 10, repetitions: 3 });

// sway: smooth combined position+rotation drift, e.g. an idle breathing/swaying loop
// (decay defaults to 0 = constant amplitude, unlike the other primitives above)
await effects.swayEffect("liam", { distance: 8, angle: 3, repetitions: 4 });

// punch: a single fast impulse with a settle-back overshoot, e.g. taking a hit
await effects.punchEffect("liam", { mode: "scale", strength: 0.3, overshoot: 0.3 });
await effects.punchEffect("liam", { mode: "rotation", strength: 20 });

// low-level: animate arbitrary numeric properties with motion-style keyframes
canvas.animate("liam", { alpha: [0, 1], y: [50, 0] }, { duration: 0.8 });
```

There's no separate "tremble"/"vibration" primitive — that's just `shakeEffect` configured with a
small `maxShockSize` and a high `shocksNumber` (high-frequency, low-amplitude shaking).

## Filter-based articulated animations

The same `effects` namespace also has primitives built on the `filters` module (raw `pixi-filters`/
`pixi.js` filter classes, re-exported as `filters.*` - see `@drincs/pixi-vn/filters`) instead of
`canvas.animate`: each one attaches a filter to the component, drives one of the filter's own
properties through a decaying (or one-shot) keyframe array via `filters.animate`, and detaches/destroys
the filter once done - the component is left exactly as it was before, same guarantee as every effect
above.

```ts
import { effects } from "@drincs/pixi-vn";

// glitch: jittery, decaying bursts of slice displacement with a matching red/blue channel split
// (returns two ticker ids; `rgbSplit: 0` drops the channel split)
await effects.glitchEffect("liam", { strength: 40, bursts: 3, rgbSplit: 6 });

// chromaticAberration: red/blue channels split apart and snap back, in a decaying burst
await effects.chromaticAberrationEffect("liam", { strength: 8, axis: "horizontal" });

// shockwave: a single ripple distortion travels outward from `origin` (normalized to the element's
// bounds) - by default until it has fully left the element
await effects.shockwaveEffect("liam", { origin: { x: 0.5, y: 0.5 } });

// radialBlur: a decaying burst of zoom-blur radiating from `origin` (normalized to the element's bounds)
await effects.radialBlurEffect("liam", { strength: 0.3, bursts: 1 });

// blurPulse: a repeated, decaying blur bump (distinct from blurIn/blurOut, which are one-shot
// reveal/conceal transitions, not a repeated pulse)
await effects.blurPulseEffect("liam", { strength: 8, pulses: 3 });

// vignettePulse: the edges darken and recover, in a repeated, decaying pulse
await effects.vignettePulseEffect("liam", { strength: 1, pulses: 1 });

// desaturate: color drains out and recovers - a single dip, not a repeated pulse
await effects.desaturateEffect("liam", { amount: 0, holdDuration: 0.2 });

// glowPulse: a repeated, decaying outward glow
await effects.glowPulseEffect("liam", { strength: 4, pulses: 3, color: 0xffee00 });
```

All 8 are per-component (same `alias` pattern as everything else here) - there's no screen-wide/global
filter effect yet. Distortion effects (glitch, chromatic aberration, shockwave, radial blur) move
pixels around, so they only read on an image with detail/edges - on a flat, single-color element they
look like nothing happened. Build a custom one the same way: construct any `filters.*` class, attach it to
`component.filters` yourself, and drive it with `filters.animate` (see the low-level example just above
this section) - `AdjustmentFilter`/`HslAdjustmentFilter` (color grading), `CRTFilter`/`OldFilmFilter`
(retro looks), and `BloomFilter`/`AdvancedBloomFilter` (glow) are good starting points not covered above.

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
in this same skill folder (registering a `Ticker`, `tickers.addSequence`,
`tickers.pause`/`resume`/`remove`, `tickers.completeOnStepEnd`). Docs:
[pixi-vn.com/start/canvas-tickers](https://pixi-vn.com/start/canvas-tickers).

## External rendering plugins

These optional packages are installed separately from `@drincs/pixi-vn`; their component
classes must be imported from the plugin, not the engine. Check the installed package's peer
dependencies and types before adapting examples to a project's PixiJS/Pixi'VN versions.

### Live2D: `@drincs/pixi-vn-live2d`

Use this wrapper around `untitled-pixi-live2d-engine` for Live2D models. Register its render
plugin **before** `Game.init()` (or `canvas.init()`):

```ts
import { extensions } from "pixi.js";
import { Live2DPlugin } from "@drincs/pixi-vn-live2d/core";

extensions.add(Live2DPlugin);
// Initialize the game/canvas after registering the plugin.
```

Once the canvas is initialized, register the model asset and await model readiness before
controlling it:

```ts
import { Assets, canvas } from "@drincs/pixi-vn";
import { Live2D } from "@drincs/pixi-vn-live2d";

Assets.add({ alias: "hero-model", src: "/models/hero/model3.json" });
const model = new Live2D({ source: "hero-model" });
await model.ready;
model.motion("Idle"); // Use a motion group present in this model.
canvas.add("hero", model);
```

Consult the [plugin README](https://github.com/DRincs-Productions/pixi-vn-live2d) for setup
and its [API reference](https://pixi-vn.com/jsdoc/pixi-vn-live2d/index/interfaces/Live2DOptions)
for model options. Do not substitute `ImageSprite.load()` for `Live2D.ready`.

### Spine: `@drincs/pixi-vn-spine`

Use this wrapper around `@esotericsoftware/spine-pixi-v8` for skeletal animation. Add
`import "@drincs/pixi-vn-spine";` to the app entry point: importing the package registers
the serializable component. A lazy scene import alone is insufficient when a save is restored
before that scene has ever loaded.

Register the skeleton and atlas in the asset manifest, then load both before construction:

```ts
import { Assets, canvas } from "@drincs/pixi-vn";
import { Spine } from "@drincs/pixi-vn-spine";

await Assets.load(["hero-skeleton", "hero-atlas"]);
const model = new Spine({ skeleton: "hero-skeleton", atlas: "hero-atlas" });
model.setAnimation(0, "idle", true); // Animation names come from the skeleton.
canvas.add("hero", model);
```

See the [Spine guide](https://pixi-vn.com/start/canvas-spine2d) for skins and tracks and the
[package README](https://www.npmjs.com/package/@drincs/pixi-vn-spine) for save-registration
details. Keep the Pixi'VN wrapper when adding saved scene elements.

## UI layers

Persistent UI chrome (HUD, menus) does **not** live on `gameLayer` — it lives on a separate,
non-save-able layer built with `canvas.layers.add`/`get`/`remove` (PixiJS-only UI) or
`canvas.htmlLayers.add`/`get`/`remove` (mounting a DOM-based UI framework like React
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
