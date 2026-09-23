import type { CanvasBaseInterface } from "@canvas/interfaces/CanvasBaseInterface";
import { Graphics } from "@drincs/pixi-vn/pixi.js";

/**
 * A snapshot of a component's own (untransformed) bounds, captured once when a mask/filter transition
 * starts. Transitions don't expect the component to resize mid-effect, the same simplification the
 * existing move/zoom/push transitions already make by computing their destination once upfront.
 */
export interface BoundsSnapshot {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function snapshotLocalBounds(component: CanvasBaseInterface<any>): BoundsSnapshot {
    const bounds = component.getLocalBounds();
    return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
}

export interface WipeFilterConfig {
    kind: "wipe";
    angle: number;
    invert: boolean;
    bounds: BoundsSnapshot;
}
export interface IrisFilterConfig {
    kind: "iris";
    originX: number;
    originY: number;
    aspect: number;
    invert: boolean;
    bounds: BoundsSnapshot;
}
export interface SplitFilterConfig {
    kind: "split";
    orientation: "horizontal" | "vertical";
    origin: number;
    invert: boolean;
    bounds: BoundsSnapshot;
}
export type FilterTransitionConfig = WipeFilterConfig | IrisFilterConfig | SplitFilterConfig;

/**
 * Per-ticker-instance, non-serializable scratch space: the actual `Graphics` mask a transition is
 * driving. A fresh, empty context is created whenever the `MotionFilterTicker` driving a mask-based
 * transition (wipe/iris/split - see `addMotionValueEffect` in `canvas-transition.ts`) is (re)constructed
 * - including when a save is restored - so the mask is always lazily recreated on the first `apply()`
 * call rather than persisted.
 */
export interface FilterTransitionContext {
    graphics?: Graphics;
}

/**
 * Gets (creating if needed) the `Graphics` mask for `component`.
 *
 * `Sprite`/`Graphics` have `allowChildren = false` in PixiJS v8 (they're leaf render nodes), so the
 * mask can't be added as a child of the component being masked - PixiJS logs a deprecation warning
 * today and will refuse it outright in a future version. Instead the mask is added as a **sibling**
 * (a child of `component.parent`) with the same transform copied over each frame, so the mask's own
 * local drawing coordinates (computed from `component`'s local bounds, see {@link applyFilterTransition})
 * still line up with `component` on screen exactly as if it were a child.
 */
function getOrCreateMaskGraphics(
    component: CanvasBaseInterface<any>,
    ctx: FilterTransitionContext,
): Graphics {
    if (!ctx.graphics) {
        ctx.graphics = new Graphics();
        component.parent?.addChild(ctx.graphics);
        component.mask = ctx.graphics;
    }
    syncMaskTransform(component, ctx.graphics);
    return ctx.graphics;
}

function syncMaskTransform(component: CanvasBaseInterface<any>, graphics: Graphics) {
    graphics.position.copyFrom(component.position);
    graphics.scale.copyFrom(component.scale);
    graphics.pivot.copyFrom(component.pivot);
    graphics.skew.copyFrom(component.skew);
    graphics.rotation = component.rotation;
}

function cleanupMask(component: CanvasBaseInterface<any>, ctx: FilterTransitionContext) {
    if (ctx.graphics) {
        component.mask = null;
        ctx.graphics.parent?.removeChild(ctx.graphics);
        ctx.graphics.destroy({ children: true });
        ctx.graphics = undefined;
    }
}

/**
 * Applies a single {@link FilterTransitionConfig} at the given `value` (a `0`-`1` reveal fraction). This
 * is the one place that knows how to turn "one animated number" into mask geometry - the generic
 * mechanism `wipeIn`/`wipeOut`/`irisIn`/`irisOut`/`splitIn`/`splitOut` in `canvas-transition.ts` are
 * built on. `blurIn`/`blurOut`/`pixelateIn`/`pixelateOut` don't go through this - they animate a
 * `Filter`'s own properties directly via `canvas.animateFilter`/`MotionFilterTicker`, since (unlike
 * these three) they have no mask geometry to compute, just a filter property to drive.
 */
export function applyFilterTransition(
    component: CanvasBaseInterface<any>,
    config: FilterTransitionConfig,
    value: number,
    ctx: FilterTransitionContext,
) {
    switch (config.kind) {
        case "wipe": {
            const progress = config.invert ? 1 - value : value;
            const { bounds } = config;
            const graphics = getOrCreateMaskGraphics(component, ctx);
            const cx = bounds.x + bounds.width / 2;
            const cy = bounds.y + bounds.height / 2;
            const diag = Math.sqrt(bounds.width ** 2 + bounds.height ** 2) || 1;
            const revealLength = Math.max(progress, 0) * diag * 2;
            const angleRad = (config.angle * Math.PI) / 180;
            graphics.clear();
            if (revealLength > 0) {
                const cos = Math.cos(-angleRad);
                const sin = Math.sin(-angleRad);
                const points = [
                    [-diag, -diag],
                    [-diag + revealLength, -diag],
                    [-diag + revealLength, diag],
                    [-diag, diag],
                ].flatMap(([x, y]) => [cx + x * cos - y * sin, cy + x * sin + y * cos]);
                graphics.poly(points).fill(0xffffff);
            }
            break;
        }
        case "iris": {
            const progress = config.invert ? 1 - value : value;
            const { bounds } = config;
            const graphics = getOrCreateMaskGraphics(component, ctx);
            const cx = bounds.x + bounds.width * config.originX;
            const cy = bounds.y + bounds.height * config.originY;
            const farX = Math.max(cx - bounds.x, bounds.x + bounds.width - cx);
            const farY = Math.max(cy - bounds.y, bounds.y + bounds.height - cy);
            const maxRadius = Math.sqrt(farX ** 2 + farY ** 2) || 1;
            const radius = Math.max(progress, 0) * maxRadius;
            const aspect = config.aspect > 0 ? config.aspect : 1;
            graphics.clear();
            if (radius > 0) {
                graphics.ellipse(cx, cy, radius * aspect, radius).fill(0xffffff);
            }
            break;
        }
        case "split": {
            const progress = config.invert ? 1 - value : value;
            // `progress` is 0 (hidden) -> 1 (fully shown), same convention as "wipe"/"iris". The two
            // mask panels start pulled apart past the component's own edges (no overlap, nothing
            // visible) and slide toward each other as progress grows, meeting exactly at the split line
            // - "closed" - once progress reaches 1, at which point they cover the component completely.
            const retreat = 1 - progress;
            const { bounds } = config;
            const graphics = getOrCreateMaskGraphics(component, ctx);
            graphics.clear();
            if (config.orientation === "horizontal") {
                const splitX = bounds.x + bounds.width * config.origin;
                const leftWidth = splitX - bounds.x;
                const rightWidth = bounds.x + bounds.width - splitX;
                const leftX = bounds.x - retreat * leftWidth;
                const rightX = splitX + retreat * rightWidth;
                if (leftWidth > 0) {
                    graphics.rect(leftX, bounds.y, leftWidth, bounds.height).fill(0xffffff);
                }
                if (rightWidth > 0) {
                    graphics.rect(rightX, bounds.y, rightWidth, bounds.height).fill(0xffffff);
                }
            } else {
                const splitY = bounds.y + bounds.height * config.origin;
                const topHeight = splitY - bounds.y;
                const bottomHeight = bounds.y + bounds.height - splitY;
                const topY = bounds.y - retreat * topHeight;
                const bottomY = splitY + retreat * bottomHeight;
                if (topHeight > 0) {
                    graphics.rect(bounds.x, topY, bounds.width, topHeight).fill(0xffffff);
                }
                if (bottomHeight > 0) {
                    graphics.rect(bounds.x, bottomY, bounds.width, bottomHeight).fill(0xffffff);
                }
            }
            break;
        }
    }
}

/**
 * Removes whatever mask {@link applyFilterTransition} attached, restoring the component to exactly the
 * state it was in before the transition - transitions must never permanently change unrelated component
 * state once they complete.
 */
export function cleanupFilterTransition(
    component: CanvasBaseInterface<any>,
    config: FilterTransitionConfig,
    ctx: FilterTransitionContext,
) {
    switch (config.kind) {
        case "wipe":
        case "iris":
        case "split":
            cleanupMask(component, ctx);
            break;
    }
}
