# Pixi'VN UI: building UI with PixiJS

Part of the `pixi-vn-ui` skill — read `SKILL.md` first. This file covers building UI screens out of
**plain PixiJS components**, either instead of an HTML framework or combined with one. Docs:
[pixi-vn.com/start/interface-pixijs](https://pixi-vn.com/start/interface-pixijs).

Since the entire rendering side of Pixi'VN is built on PixiJS (see `pixi-vn-canvas`), you don't need
React/Vue at all to build a UI — a **PixiJS UI Layer** lets you add ordinary PixiJS components
directly to the stage.

## `layers.add` / `layers.get` / `layers.remove`

`canvas.add`/`remove`/`find` (see `pixi-vn-canvas`) all operate on the single `gameLayer` — the
save-able scene graph. A PixiJS UI Layer is different: it's a plain `PIXI.Container` (the `Layer`
type is just an alias for `Container<ContainerChild>` — no special class) attached directly to the
PixiJS stage, a sibling of `gameLayer`, entirely outside the save system.

```ts
import { canvas, Container } from "@drincs/pixi-vn";

const uiLayer = canvas.layers.add("ui", new Container());
// ... later
const layer = canvas.layers.get("ui");
canvas.layers.remove("ui");
```

- **`canvas.layers.add(label, layer)`** — attaches a `Container` to the stage under `label` and
  returns it (`Layer | undefined`).
- **`canvas.layers.get(label)`** — returns the `Layer | null` registered under `label`.
- **`canvas.layers.remove(label)`** — removes it from the stage.

Compared to `canvas.layers.gameLayer`, a PixiJS UI Layer:

- **Is not included in saves.** Its current state is never part of `Game.exportGameState()`/a save
  file — see `pixi-vn-saves`. Persist anything that must survive a reload through
  [game storage](https://pixi-vn.com/start/storage) instead (see `SKILL.md`'s "Connecting UI to game
  data").
- **Has better performance** — Pixi'VN does no save/restore bookkeeping on it.
- **Can't use Pixi'VN-specific features** (aliases, `canvas.animate`'s save-tracked state,
  transition helpers) — for animating raw PixiJS UI, the docs recommend importing `animate` from
  `@drincs/pixi-vn/motion` directly instead of `canvas.animate`, since it skips that bookkeeping and
  is cheaper (see `pixi-vn-canvas`).
- **Accepts any PixiJS-compatible component** — being a plain `Container`, anything that works with
  raw PixiJS works here, including third-party PixiJS UI component libraries.

`canvas.layers.add`/`remove` refuse the reserved `CANVAS_APP_GAME_LAYER_ALIAS`
(`"__game_layer__"`) alias, same as `canvas.add`/`remove`.

## Combining PixiJS and HTML UI layers

A PixiJS UI layer and an HTML UI layer (see `SKILL.md`) aren't mutually exclusive — you can add
PixiJS components into the "ui" layer during the first render of an HTML screen, and clean them up
when that screen unmounts:

```tsx title="React"
import { useEffect } from "react";
import { Assets, canvas } from "@drincs/pixi-vn";
import { Sprite } from "pixi.js";

export default function MyScreen() {
  useEffect(() => {
    const layer = canvas.layers.get("ui");
    if (layer) {
      (async () => {
        const texture = await Assets.load(
          "https://pixijs.com/assets/bunny.png",
        );
        layer.addChild(new Sprite(texture));
      })();
    }

    return () => {
      canvas.layers.get("ui")?.removeChildren();
    };
  }, []);

  return null;
}
```

Official templates create a PixiJS layer named `"ui"` on startup (see `SKILL.md`'s "Real-world
layer conventions") specifically so screens like this have a ready-made layer to attach to.

## Component libraries

Building an entire UI in raw PixiJS primitives (`Graphics`, `Text`, `Sprite`) gets tedious fast for
anything beyond a few elements — these libraries add higher-level, ready-made UI components on top
of PixiJS:

- [PixiJS](https://pixijs.com/) — the base rendering library itself.
- [PixiUI](https://github.com/pixijs/ui) — buttons, sliders, lists, scroll boxes, and other common
  widgets built on PixiJS.
- [PixiLayout](https://github.com/pixijs/layout) — flex/CSS-like layout for PixiJS component trees,
  useful once a UI has more than a handful of manually-positioned elements.
