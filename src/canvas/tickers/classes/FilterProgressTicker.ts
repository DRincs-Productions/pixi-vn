import type { FilterTransitionConfig, FilterTransitionContext } from "@canvas/functions/canvas-filter-transition-utility";
import {
    applyFilterTransition,
    cleanupFilterTransition,
} from "@canvas/functions/canvas-filter-transition-utility";
import type { EasingInput } from "@canvas/functions/canvas-easing-utility";
import { resolveEasing } from "@canvas/functions/canvas-easing-utility";
import { canvas } from "../..";
import RegisteredTickers from "../decorators/RegisteredTickers";
import type TickerArgs from "../interfaces/TickerArgs";
import TickerBase from "./TickerBase";
import type TickerValue from "./TickerValue";

export interface FilterProgressTickerArgs extends TickerArgs {
    /** The visual effect to drive, and its static (non-animated) configuration. */
    config: FilterTransitionConfig;
    /** The value {@link config} is animated from. */
    from: number;
    /** The value {@link config} is animated to. */
    to: number;
    /** Duration of the animation, in seconds. */
    duration: number;
    /** Delay before the animation starts, in seconds. */
    delay?: number;
    /** A subset of `motion`'s `ease` option - see {@link resolveEasing}. */
    ease?: EasingInput;
    aliasToRemoveAfter?: string[];
    tickerAliasToResume?: string[];
    tickerIdToResume?: string[];
}

/**
 * Drives the one animated number ({@link FilterProgressTickerArgs.from} -> `to`) that every mask/filter
 * based transition (`wipeIn`/`wipeOut`, `irisIn`/`irisOut`, `splitIn`/`splitOut`, `blurIn`/`blurOut`,
 * `pixelateIn`/`pixelateOut`) needs, and delegates what that number *means* to
 * {@link applyFilterTransition}. This is the "generic filter transition" mechanism: one ticker, a
 * pluggable per-kind visual effect, instead of a bespoke ticker per transition.
 *
 * Deliberately implemented without depending on `src/motion` (which itself depends on `canvas`, so
 * importing it here would create a circular module dependency) - it manually tracks elapsed time and
 * resolves a small subset of easing inputs via {@link resolveEasing}.
 */
export default class FilterProgressTicker extends TickerBase<FilterProgressTickerArgs> {
    private elapsedMs = 0;
    private finished = false;
    private readonly ctx: FilterTransitionContext = {};

    /**
     * `PIXI.Ticker.add()` (called by {@link TickerBase.start}) only schedules `fn` for the *next* tick,
     * it never invokes it synchronously. Without this override, the component `swapComponentForEffect`
     * just added to the stage would render fully unmasked/unfiltered - i.e. in its final, "transition
     * complete" state - for that one frame before `fn` ever runs and applies the `from` value. Applying
     * the current value synchronously here, before `super.start()` hands off to the ticker, closes that
     * gap: the mask/filter is already in its starting state by the time this component is first rendered.
     */
    override start(): void {
        this.applyValue(this.elapsedMs);
        super.start();
    }

    private applyValue(elapsedMs: number): number {
        const args = this.args;
        const delayMs = (args.delay ?? 0) * 1000;
        const durationMs = Math.max(args.duration, 0) * 1000;
        let linear = 0;
        if (elapsedMs >= delayMs) {
            linear = durationMs <= 0 ? 1 : Math.min((elapsedMs - delayMs) / durationMs, 1);
        }
        const eased = resolveEasing(args.ease)(linear);
        const value = args.from + (args.to - args.from) * eased;
        this.canvasElementAliases.forEach((alias) => {
            const component = canvas.find(alias);
            if (component) {
                applyFilterTransition(component, args.config, value, this.ctx);
            }
        });
        return linear;
    }

    fn(_ticker: TickerValue, args: FilterProgressTickerArgs, aliases: string[], tickerId: string): void {
        if (this.finished) {
            return;
        }
        this.elapsedMs += _ticker.deltaMS;
        const linear = this.applyValue(this.elapsedMs);
        if (linear >= 1) {
            this.finish(tickerId, args, aliases);
        }
    }

    private finish(tickerId: string, args: FilterProgressTickerArgs, aliases: string[]): void {
        if (this.finished) {
            return;
        }
        this.finished = true;
        aliases.forEach((alias) => {
            const component = canvas.find(alias);
            if (component) {
                cleanupFilterTransition(component, args.config, this.ctx);
            }
        });
        canvas.tickers.onComplete(tickerId, {
            aliasToRemoveAfter: args.aliasToRemoveAfter ?? [],
            tickerAliasToResume: args.tickerAliasToResume ?? [],
            tickerIdToResume: args.tickerIdToResume ?? [],
            stopTicker: true,
        });
    }

    override complete(options?: { ignoreTickerSteps?: boolean }): void {
        this.finish(this.id, this.args, this.canvasElementAliases);
        super.complete(options);
    }
}

RegisteredTickers.add(FilterProgressTicker, "pixivn-filter-progress");
