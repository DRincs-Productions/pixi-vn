import { AnimationPlaybackControlsWithThen } from "motion";
import { Ticker as PixiTicker, UPDATE_PRIORITY } from "pixi.js";
import { canvas, CanvasBaseInterface, CommonTickerProps, Ticker, TickerArgs } from "../..";
import { logger } from "../../../utils/log-utility";
import { TickerIdType } from "../../types/TickerIdType";

export default abstract class MotionTickerBase<
    TArgs extends TickerArgs & {
        startState?: object;
        time?: number;
        options: Omit<CommonTickerProps, "startOnlyIfHaveTexture">;
    }
> implements Ticker<TArgs>
{
    /**
     * @param args The arguments that you want to pass to the ticker.
     * @param duration The duration of the ticker in seconds. If is undefined, the step will end only when the animation is finished (if the animation doesn't have a goal to reach then it won't finish). @default undefined
     * @param priority The priority of the ticker. @default UPDATE_PRIORITY.NORMAL
     */
    constructor(args: TArgs, duration?: number, priority?: UPDATE_PRIORITY) {
        this._args = args;
        this.duration = duration;
        this.priority = priority;
    }
    id: TickerIdType = "motion";
    protected _args: TArgs;
    get args(): TArgs {
        return { ...this._args, time: this.animation?.time };
    }
    duration?: number;
    priority?: UPDATE_PRIORITY;
    protected ticker = new PixiTicker();
    animation?: AnimationPlaybackControlsWithThen;
    /**
     * This is a hack to fix this [issue](https://github.com/motiondivision/motion/issues/3336)
     */
    private stopped = false;
    /**
     * This is a hack to fix this [issue](https://github.com/motiondivision/motion/issues/3337)
     */
    private ignoreOnComplete = true;
    protected tickerId?: string;
    canvasElementAliases: string[] = [];
    protected getItemByAlias(alias: string): CanvasBaseInterface<any> | undefined {
        if (!this.canvasElementAliases.includes(alias)) {
            return;
        }
        let element = canvas.find(alias);
        if (!element) {
            return;
        }
        return element;
    }
    /**
     * This is a hack to await for the animation to complete.
     */
    private timeout = 50;
    async complete() {
        if (!this.animation) {
            logger.warn("MotionTicker.complete() called without animation set. This may cause issues.");
            return;
        }
        this.animation.complete();
        await new Promise((resolve) => setTimeout(resolve, this.timeout));
    }
    stop() {
        if (!this.animation) {
            logger.warn("MotionTicker.stop() called without animation set. This may cause issues.");
            return;
        }
        this.stopped = true;
        this.animation.stop();
    }
    abstract start(id: string): void;
    protected onComplete = () => {
        if (this.ignoreOnComplete) {
            return;
        }
        // TODO: viene eseguita 2 volte
        const id = this.tickerId;
        if (!id) {
            logger.warn("MotionTicker.complete() called without tickerId set. This may cause issues.");
            return;
        }
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
        canvas.onTickerComplete(id, {
            aliasToRemoveAfter: aliasToRemoveAfter,
            tickerAliasToResume: tickerAliasToResume,
            tickerIdToResume: tickerIdToResume,
            stopTicker: false,
        });
    };
    protected createItem(alias: string): CanvasBaseInterface<any> {
        return new Proxy(
            { alias: alias },
            {
                set: ({ alias }, p, newValue) => {
                    if (this.stopped) {
                        return true;
                    }
                    if (this._args.startState && (this._args.startState as any)[p] === newValue) {
                        return true;
                    }
                    let target = this.getItemByAlias(alias);
                    if (!target) {
                        return true;
                    }
                    if (this.ignoreOnComplete) {
                        setTimeout(() => {
                            this.ignoreOnComplete = false;
                        }, 10);
                    }
                    switch (p) {
                        case "pivotX":
                            target.pivot.x = newValue;
                            break;
                        case "pivotY":
                            target.pivot.y = newValue;
                            break;
                        case "scaleX":
                            target.scale.x = newValue;
                            break;
                        case "scaleY":
                            target.scale.y = newValue;
                            break;
                        default:
                            (target as any)[p] = newValue;
                            break;
                    }
                    return true;
                },
                get: ({ alias }, p) => {
                    if (!this._args.startState) {
                        this._args.startState = {};
                    }
                    if (p in this._args.startState) {
                        return (this._args.startState as any)[p];
                    }
                    let target = this.getItemByAlias(alias);
                    if (!target) {
                        return;
                    }
                    let res = undefined;
                    switch (p) {
                        case "pivotX":
                            res = target.pivot.x;
                            break;
                        case "pivotY":
                            res = target.pivot.y;
                            break;
                        case "scaleX":
                            res = target.scale.x;
                            break;
                        case "scaleY":
                            res = target.scale.y;
                            break;
                        default:
                            res = (target as any)[p];
                            break;
                    }
                    this._args.startState = {
                        ...this._args.startState,
                        [p]: res,
                    };
                    return res;
                },
                has: ({ alias }, p) => {
                    let target = this.getItemByAlias(alias);
                    if (!target) {
                        return false;
                    }
                    switch (p) {
                        case "pivotX":
                            return "pivot" in target && "x" in target.pivot;
                        case "pivotY":
                            return "pivot" in target && "y" in target.pivot;
                        case "scaleX":
                            return "scale" in target && "x" in target.scale;
                        case "scaleY":
                            return "scale" in target && "y" in target.scale;
                        default:
                            return p in target;
                    }
                },
                ownKeys: ({ alias }) => {
                    let target = this.getItemByAlias(alias);
                    if (!target) {
                        return [];
                    }
                    return Object.keys(target);
                },
            }
        ) as any as CanvasBaseInterface<any>;
    }
    pause() {
        if (!this.animation) {
            logger.warn("MotionTicker.pause() called without animation set. This may cause issues.");
            return;
        }
        this.animation.pause();
    }
    play() {
        if (!this.animation) {
            logger.warn("MotionTicker.play() called without animation set. This may cause issues.");
            return;
        }
        this.animation.play();
    }
    get paused(): boolean {
        if (!this.animation) {
            logger.warn("MotionTicker.paused() called without animation set. This may cause issues.");
            return true;
        }
        return this.animation.state === "paused";
    }
}
