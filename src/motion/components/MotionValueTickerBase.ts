import type { CommonTickerProps, Ticker, TickerArgs } from "@drincs/pixi-vn/canvas";
import { canvas } from "@drincs/pixi-vn/canvas";
import { PixiError } from "@drincs/pixi-vn/core";
import type { UPDATE_PRIORITY } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import sha1 from "crypto-js/sha1";
import type { AnimationPlaybackControlsWithThen } from "motion";

/**
 * Twin of {@link MotionFilterTickerBase}, driving a `motion` animation against a plain numeric
 * "progress" value instead of a canvas element's or a `Filter`'s properties - the generic mechanism
 * behind `FilterProgressTicker`'s replacement: `wipeIn`/`wipeOut`, `irisIn`/`irisOut`,
 * `splitIn`/`splitOut` all drive one animated number and hand it to `applyFilterTransition` to turn
 * into mask geometry, so there's no canvas element property or Filter property to write directly -
 * just a number and a side effect. `apply`/`cleanup` are that side effect, decided entirely from the
 * outside (see {@link MotionValueTicker}).
 *
 * Unlike {@link MotionFilterTickerBase}'s Proxy-wrapped target (needed there to let `motion` read a
 * Filter's *current* property value for partial keyframes), this ticker's keyframes are always fully
 * explicit (`[from, to]`) - nothing ever needs to be read back - so `motion` animates a private plain
 * object and this class only listens via `onUpdate`, skipping the Proxy/`startState` machinery
 * entirely.
 */
export default abstract class MotionValueTickerBase<
    TArgs extends TickerArgs & {
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
             * Called on every frame with the current interpolated value. Deliberately a constructor
             * option, not part of `TArgs`: `TArgs` is what {@link args} exposes as this ticker's
             * serializable save data - a function reference has no business there (see
             * {@link MotionFilterTickerBase}'s own `filter`/`cleanup` doc comments for the equivalent
             * reasoning).
             *
             * Optional only for structural compatibility with `RegisteredTickers`' generic constructor
             * shape; genuinely required to use the ticker, so a missing value throws immediately - in
             * practice this ticker cannot be reconstructed through `RegisteredTickers.getInstance`
             * (alias-transfer, save restore), the same already-accepted limitation `MotionFilterTicker`
             * has for its own `filter`/`cleanup`.
             */
            apply?: (value: number) => void;
            /**
             * Called once, right before completion handling (`canvas.tickers.onComplete`) - mirrors
             * {@link MotionFilterTickerBase}'s own `cleanup`, deferred the same way (see {@link onComplete}).
             */
            cleanup?: () => void;
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
             * The aliases of the canvas elements that are connected to this ticker. This base class
             * never looks elements up through these itself (unlike `MotionTickerBase`) - {@link apply}
             * decides what, if anything, to do with them - but they're kept so the ticker still
             * participates in the same canvas-element-driven cleanup/transfer bookkeeping. @default []
             */
            canvasElementAliases?: string[];
        },
    ) {
        const {
            apply,
            cleanup,
            duration,
            priority,
            id = this.generateTickerId(args),
            canvasElementAliases = [],
        } = options || {};
        if (!apply) {
            throw new PixiError(
                "not_implemented",
                "MotionValueTicker requires an `apply` callback; it cannot be reconstructed from saved/serialized ticker args.",
            );
        }
        this._args = args;
        this.apply = apply;
        this.cleanup = cleanup;
        this.duration = duration;
        this.priority = priority;
        this.id = id;
        this.canvasElementAliases = canvasElementAliases;
    }
    abstract alias: string;
    readonly id: string;
    protected readonly apply: (value: number) => void;
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
     * `MotionTickerBase._paused`'s doc comment for the full explanation - identical reasoning applies
     * here.
     */
    private _paused: boolean = false;
    /**
     * See {@link MotionFilterTickerBase.suppressWritesDuring}'s doc comment - identical purpose, applied
     * to {@link createUpdateHandler}'s callback instead of a proxy trap.
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
                "_motion_value_" +
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
            // See MotionFilterTickerBase.onComplete's doc comment: `motion` can still have a trailing
            // "snap to the exact final value" write queued on `this.ticker` for the *next* tick, so
            // `cleanup` (which typically tears down mask/filter state) is deferred through the same
            // ticker to guarantee it runs after any such pending write.
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
        canvas.tickers.onComplete(id, {
            aliasToRemoveAfter: aliasToRemoveAfter,
            tickerAliasToResume: tickerAliasToResume,
            tickerIdToResume: tickerIdToResume,
            stopTicker: false,
        });
    };
    /**
     * Returns the `onUpdate` handler {@link MotionValueTicker} hands to `motion`'s own `animate()`:
     * forwards the interpolated value to {@link apply}, unless writes are currently suppressed (see
     * {@link suppressWritesDuring}) or the ticker has been {@link stop}ped.
     */
    protected createUpdateHandler(): (latest: { value: number }) => void {
        return (latest) => {
            if (this.stopped || this._paused) {
                return;
            }
            this.apply(latest.value);
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
