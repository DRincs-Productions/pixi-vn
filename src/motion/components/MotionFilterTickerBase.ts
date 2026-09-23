import { PixiError } from "@drincs/pixi-vn/core";
import type { Filter, UPDATE_PRIORITY } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { tickers } from "@drincs/pixi-vn/tickers";
import type { CommonTickerProps, Ticker, TickerArgs } from "@drincs/pixi-vn/tickers";
import sha1 from "crypto-js/sha1";
import type { AnimationPlaybackControlsWithThen } from "motion";

/**
 * Twin of `MotionTickerBase`, driving a `motion` animation against either a PixiJS `Filter`'s own
 * properties, or a plain numeric "progress" value with no live target at all - the two cases
 * `filters.animate` unifies (see `MotionFilterTicker`):
 *
 * - **`filter` provided**: which filter to manipulate is entirely decided from the outside - `filter`
 *   is just whatever `Filter` instance the caller passes in (a `BlurFilter`, the library's own
 *   `PixelateFilter`, or any custom one). This base class doesn't know or care about its concrete
 *   type, so any (numeric/color) property on it can be animated. {@link createItem} wraps it in a
 *   `motion`-compatible proxy that writes property changes directly onto the real filter.
 * - **`filter` omitted**: there's nothing to write to - `motion` animates a private plain `{ value }`
 *   object instead, and {@link createUpdateHandler} forwards each frame's interpolated value to
 *   {@link apply}. Used by the mask-based transitions (wipe/iris/split), which have no filter property
 *   to drive, just a number that `applyWipeTransition`/`applyIrisTransition`/`applySplitTransition`
 *   turns into mask geometry.
 *
 * Reuses the same `_paused`/`suppressWritesDuring`/resuming-`time` handling as `MotionTickerBase`
 * verbatim: `motion`'s `animate()` writes its first keyframe to the target synchronously during
 * construction, which would prematurely mutate the filter (or fire `apply`) before a resumed ticker's
 * `.time` seek can run - see that class's doc comments for the full explanation.
 */
export default abstract class MotionFilterTickerBase<
    TArgs extends TickerArgs & {
        startState?: object;
        time?: number;
        options?: Omit<CommonTickerProps, "startOnlyIfHaveTexture"> & {
            autoplay?: boolean;
        };
    },
> implements Ticker<TArgs>
{
    /**
     * @param args The arguments that you want to pass to the ticker.
     * @param options The options of the ticker.
     */
    constructor(
        args: TArgs,
        options?: {
            /**
             * The `Filter` instance this ticker animates, or `undefined` to animate a plain numeric
             * value instead (see {@link apply}). Deliberately a constructor option, not part of
             * `TArgs`: `TArgs` is what {@link args} exposes as this ticker's serializable save data (see
             * `MotionTickerBase`, which instead references its target only by alias, looked up fresh
             * each frame) - a live `Filter` instance isn't JSON-serializable (it holds GPU program/resource
             * references that produce circular structures), so embedding it in `TArgs` broke
             * `createExportableElement()` any time a ticker's `args` were serialized (e.g.
             * `CanvasManager.export()`, called on every history step) while a `blurIn`/`pixelateIn`
             * animation was in flight.
             *
             * At least one of `filter`/`apply` is genuinely required to actually use the ticker (a
             * missing pair throws immediately), and both are optional only for structural compatibility
             * with `RegisteredTickers`' generic constructor shape. In practice this means a
             * `MotionFilterTicker` cannot be reconstructed through `RegisteredTickers.getInstance`
             * (alias-transfer, save restore) - an already-inherent limitation, since neither a live
             * `Filter` nor a function reference was ever serializable to begin with.
             */
            filter?: Filter;
            /**
             * Called on every frame with the current interpolated value, when no {@link filter} is
             * provided - required in that case (a missing pair with `filter` throws immediately).
             * Ignored when `filter` is provided (the proxy writes land directly on the filter instead).
             */
            apply?: (value: number) => void;
            /**
             * The duration of the ticker in seconds. If is undefined, the step will end only when the animation is finished (if the animation doesn't have a goal to reach then it won't finish). @default undefined
             */
            duration?: number;
            /**
             * The priority of the ticker. @default UPDATE_PRIORITY.NORMAL
             */
            priority?: UPDATE_PRIORITY;
            /**
             * The id of the ticker. This param is used by the system when will ber restoring the tickers from a save. If not provided, a random id will be generated. @default undefined
             */
            id?: string;
            /**
             * The aliases of the canvas elements that are connected to this ticker. Unlike
             * `MotionTickerBase`, this base class never looks elements up through these - the animation
             * target is always {@link filter} (or nothing, when animating a plain value) - but they're
             * kept so the ticker still participates in the same canvas-element-driven cleanup/transfer
             * bookkeeping (e.g. a subclass's own {@link onComplete} handling, or a future save/restore
             * integration). @default []
             */
            canvasElementAliases?: string[];
            /**
             * Called once, right before completion handling (`tickers.onComplete`) - the natural
             * place to detach/destroy {@link filter} from whatever component it was attached to, or to
             * tear down whatever {@link apply} was driving (e.g. a mask). Not called on a manual
             * {@link stop} (only on the animation's own completion), matching `TickerBase.stop()`'s
             * existing behavior of never running cleanup.
             *
             * Deliberately a constructor option, not part of `TArgs`, for the same reason as
             * {@link filter}/{@link apply}.
             */
            cleanup?: () => void;
        },
    ) {
        const {
            filter,
            apply,
            duration,
            priority,
            // Hashes `args` (already required to be JSON-serializable), not `options` - the latter
            // carries the live, non-serializable `filter` instance and/or `apply`/`cleanup` functions.
            id = this.generateTickerId(args),
            canvasElementAliases = [],
            cleanup,
        } = options || {};
        if (!filter && !apply) {
            throw new PixiError(
                "not_implemented",
                "MotionFilterTicker requires either a `filter` instance or an `apply` callback; it cannot be reconstructed from saved/serialized ticker args.",
            );
        }
        this._args = args;
        this.filter = filter;
        this.apply = apply;
        this.duration = duration;
        this.priority = priority;
        this.id = id;
        this.canvasElementAliases = canvasElementAliases;
        this.cleanup = cleanup;
    }
    abstract alias: string;
    readonly id: string;
    protected readonly filter?: Filter;
    protected readonly apply?: (value: number) => void;
    protected readonly cleanup?: () => void;
    protected _args: TArgs;
    get args(): TArgs {
        return { ...this._args, time: this._animation?.time };
    }
    duration?: number;
    priority?: UPDATE_PRIORITY;
    protected ticker = new PIXI.Ticker();
    protected _animation?: AnimationPlaybackControlsWithThen;
    abstract readonly animation: AnimationPlaybackControlsWithThen;
    /**
     * This is a hack to fix this [issue](https://github.com/motiondivision/motion/issues/3336)
     */
    private stopped = false;
    /**
     * Tracks the paused state independently of the underlying `motion` playback controls. See
     * `MotionTickerBase._paused` for the full explanation - identical reasoning applies here.
     */
    private _paused: boolean = false;
    /**
     * See `MotionTickerBase.suppressWritesDuring`'s doc comment - identical purpose, applied to the
     * filter proxy (or {@link createUpdateHandler}'s callback) instead of a canvas element proxy.
     */
    protected suppressWritesDuring<T>(fn: () => T): T {
        const wasPaused = this._paused;
        this._paused = true;
        try {
            return fn();
        } finally {
            this._paused = wasPaused;
        }
    }
    canvasElementAliases: string[] = [];
    private generateTickerId(...args: any[]): string {
        try {
            return (
                sha1(JSON.stringify(args)).toString() +
                "_motion_filter_" +
                Math.random().toString(36).substring(7)
            );
        } catch (e) {
            throw new PixiError("not_json_serializable", `Error to generate ticker id: ${e}`);
        }
    }
    /**
     * This is a hack to await for the animation to complete.
     */
    private timeout = 50;
    async complete() {
        this.animation.complete();
        await new Promise((resolve) => setTimeout(resolve, this.timeout));
    }
    stop() {
        this.stopped = true;
        this.animation.stop();
    }
    start() {
        if (this.args.options?.autoplay === false) {
            return;
        }
        this._paused = false;
        const animation = this.animation;
        // See MotionTickerBase.start()'s doc comment for why writes must stay suppressed through the
        // driver's first post-play tick too, not just the synchronous construction above.
        if (typeof (this._args as { time?: number }).time === "number") {
            this._paused = true;
            animation.play();
            this.ticker.addOnce(() => {
                this._paused = false;
            });
        } else {
            animation.play();
        }
    }
    protected onComplete = () => {
        const cleanup = this.cleanup;
        if (cleanup) {
            // `motion` can still have a trailing "snap to the exact final value" write of its own queued
            // on `this.ticker` (the very driver we handed it) for the *next* tick after `onComplete`
            // fires - calling `cleanup` (which typically destroys the filter, or tears down whatever
            // `apply` was driving) synchronously here could observe that write mid-flight (e.g. a
            // destroyed filter's internal resources already nulled out). Queuing through the same
            // `this.ticker` - rather than a microtask or an unrelated ticker like `PIXI.Ticker.system` -
            // guarantees our callback runs after any such pending write, since both share the same
            // per-tick callback order.
            this.ticker.addOnce(() => cleanup());
        }
        const id = this.id;
        let aliasToRemoveAfter = this._args.options?.aliasToRemoveAfter || [];
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        let tickerAliasToResume = this._args.options?.tickerAliasToResume || [];
        if (typeof tickerAliasToResume === "string") {
            tickerAliasToResume = [tickerAliasToResume];
        }
        let tickerIdToResume = this._args.options?.tickerIdToResume || [];
        if (typeof tickerIdToResume === "string") {
            tickerIdToResume = [tickerIdToResume];
        }
        tickers.onComplete(id, {
            aliasToRemoveAfter: aliasToRemoveAfter,
            tickerAliasToResume: tickerAliasToResume,
            tickerIdToResume: tickerIdToResume,
            stopTicker: false,
        });
    };
    /**
     * Wraps {@link filter} in a `motion`-compatible proxy: unlike `MotionTickerBase.createItem`, there's
     * no alias to re-resolve every access with (the filter instance is fixed for the ticker's lifetime,
     * decided once by whoever constructed it), so the real filter object is the proxy's own target and
     * `get`/`set` are the only traps that need overriding - `has`/`ownKeys`/etc. fall back to the real
     * filter automatically. No property is special-cased the way `pivotX`/`scaleX` are for canvas
     * elements: a `Filter`'s own properties are whatever its class defines, so this stays fully generic.
     * Only called when {@link filter} is set - see {@link createUpdateHandler} for the other case.
     */
    protected createItem(): Filter {
        const filter = this.filter as Filter;
        return new Proxy(filter, {
            set: (target, p, newValue) => {
                if (this.stopped || this._paused) {
                    return true;
                }
                if (this._args.startState && (this._args.startState as any)[p] === newValue) {
                    return true;
                }
                (target as any)[p] = newValue;
                return true;
            },
            get: (target, p) => {
                if (!this._args.startState) {
                    this._args.startState = {};
                }
                if (p in this._args.startState) {
                    return (this._args.startState as any)[p];
                }
                const res = (target as any)[p];
                this._args.startState = {
                    ...this._args.startState,
                    [p]: res,
                };
                return res;
            },
        });
    }
    /**
     * Returns the `onUpdate` handler `motion` is given when no {@link filter} is provided: forwards the
     * interpolated `value` to {@link apply}, unless writes are currently suppressed (see
     * {@link suppressWritesDuring}) or the ticker has been {@link stop}ped - the same guards
     * {@link createItem}'s proxy applies to property writes.
     *
     * Reads `target.value` directly rather than trusting `onUpdate`'s own callback argument: for a
     * single-property target/keyframes pair (`{ value: [...] }`), `motion` calls `onUpdate` with the
     * bare interpolated number itself, not a `{ value }`-shaped object - so `latest.value` was always
     * `undefined`, silently keeping the mask/progress stuck at its initial value the entire animation.
     * `motion` still writes the real number onto `target.value` synchronously before calling `onUpdate`
     * (the same guarantee {@link createItem}'s proxy relies on for filter properties), so reading it
     * back off `target` sidesteps that argument-shape quirk entirely.
     */
    protected createUpdateHandler(target: { value: number }): () => void {
        return () => {
            if (this.stopped || this._paused) {
                return;
            }
            this.apply?.(target.value);
        };
    }
    pause() {
        if (!this.animation) {
            return;
        }
        this._paused = true;
        this.animation.pause();
    }
    play() {
        this._paused = false;
        this.animation.play();
    }
    get paused(): boolean {
        if (!this.animation) {
            return true;
        }
        return this.animation.state === "paused";
    }
}
