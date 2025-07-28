import { AnimationPlaybackControlsWithThen, ObjectTarget } from "motion";
import { UPDATE_PRIORITY } from "pixi.js";
import { animate, AnimationOptions, canvas, CanvasBaseInterface, Ticker } from "../..";
import { logger } from "../../../utils/log-utility";
import { TickerIdType } from "../../types/TickerIdType";
import { checkIfTextureNotIsEmpty } from "../functions/ticker-texture-utility";

interface TArgs {
    keyframes: ObjectTarget<CanvasBaseInterface<any>>;
    options: AnimationOptions;
    /**
     * This is a hack to fix this [issue](https://github.com/motiondivision/motion/discussions/3330)
     */
    startState?: object;
    /**
     * This is a hack to fix this [issue](https://github.com/motiondivision/motion/discussions/3330)
     */
    time?: number;
}

export default class MotionTicker implements Ticker<TArgs> {
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
    private _args: TArgs;
    get args(): TArgs {
        return { ...this._args, time: this.animation?.time };
    }
    duration?: number;
    priority?: UPDATE_PRIORITY;
    animation?: AnimationPlaybackControlsWithThen;
    /**
     * This is a hack to fix this [issue](https://github.com/motiondivision/motion/issues/3336)
     */
    private stopped = false;
    protected tickerId?: string;
    canvasElementAliases: string[] = [];
    protected getItemByAlias(alias: string): CanvasBaseInterface<any> | undefined {
        if (!this.canvasElementAliases.includes(alias)) {
            return;
        }
        if (canvas.isTickerPaused(alias, this.tickerId)) {
            return;
        }
        let element = canvas.find(alias);
        if (!element) {
            return;
        }
        if (this._args.options.startOnlyIfHaveTexture) {
            if (!checkIfTextureNotIsEmpty(element)) {
                return;
            }
        }
        return element;
    }
    complete() {
        if (!this.animation) {
            logger.warn("MotionTicker.complete() called without animation set. This may cause issues.");
            return;
        }
        this.animation.complete();
    }
    stop() {
        if (!this.animation) {
            logger.warn("MotionTicker.stop() called without animation set. This may cause issues.");
            return;
        }
        this.stopped = true;
        this.animation.stop();
    }
    start(id: string) {
        this.tickerId = id;
        let proxies = this.canvasElementAliases.map((alias) => {
            return new Proxy(
                { alias: alias },
                {
                    set: ({ alias }, p, newValue) => {
                        if (this.stopped) {
                            return true;
                        }
                        let target = this.getItemByAlias(alias);
                        if (!target) {
                            return true;
                        }
                        (target as any)[p] = newValue;
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
                        this._args.startState = {
                            ...this._args.startState,
                            [p]: (target as any)[p],
                        };
                        return (target as any)[p];
                    },
                    has: ({ alias }, p) => {
                        let target = this.getItemByAlias(alias);
                        if (!target) {
                            return false;
                        }
                        return p in target;
                    },
                    ownKeys: ({ alias }) => {
                        let target = this.getItemByAlias(alias);
                        if (!target) {
                            return [];
                        }
                        return Object.keys(target);
                    },
                }
            );
        }) as any as CanvasBaseInterface<any>[];
        this.animation = animate(proxies, this._args.keyframes, {
            ...this._args.options,
            repeat: this._args.options.repeat === null ? Infinity : this._args.options.repeat,
            onComplete: () => {
                const id = this.tickerId;
                if (!id) {
                    logger.warn("MotionTicker.complete() called without tickerId set. This may cause issues.");
                    return;
                }
                let aliasToRemoveAfter = this._args.options.aliasToRemoveAfter || [];
                if (typeof aliasToRemoveAfter === "string") {
                    aliasToRemoveAfter = [aliasToRemoveAfter];
                }
                let tickerAliasToResume = this._args.options.tickerAliasToResume || [];
                if (typeof tickerAliasToResume === "string") {
                    tickerAliasToResume = [tickerAliasToResume];
                }
                canvas.onTickerComplete(id, {
                    aliasToRemoveAfter: aliasToRemoveAfter,
                    tickerAliasToResume: tickerAliasToResume,
                });
            },
        });
        if (this._args.time) {
            this.animation.time = this._args.time;
        }
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
}
