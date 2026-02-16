import type { UPDATE_PRIORITY } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import sha1 from "crypto-js/sha1";
import { canvas, CanvasManagerStatic, Ticker } from "../..";
import { logger } from "../../../utils/log-utility";
import { TickerIdType } from "../../types/TickerIdType";
import { tickerDecorator } from "../decorators/RegisteredTickers";
import TickerArgs from "../interfaces/TickerArgs";
import TickerValue from "./TickerValue";

/**
 * A class is used to create a ticker element to add into a Pixi Application.
 * You can use {@link canvas.addTicker()} to add this element into the application.
 * This class should be extended and the fn method should be overridden.
 * You must use the {@link tickerDecorator} to register the ticker in the game.
 * In Ren'Py is a transform.
 * @template TArgs The type of the arguments that you want to pass to the ticker.
 * @example
 * ```typescript
 * \@tickerDecorator() // this is equivalent to tickerDecorator("RotateTicker")
 * export class RotateTicker extends TickerBase<{ speed?: number }> {
 *     override fn(
 *         t: TickerValue, // the ticker that is calling this method
 *         args: { // the arguments that you passed when you added the ticker
 *             speed?: number,
 *         },
 *         aliases: string[], // the aliases of the canvas elements that are connected to this ticker
 *         tickerId: string, // the id of the ticker. You can use this to get the ticker from the canvas.currentTickers
 *     ): void {
 *         let speed = args.speed === undefined ? 0.1 : args.speed
 *         aliases.forEach((alias) => {
 *                 let element = canvas.find(alias)
 *                 if (element && element instanceof Container) {
 *                     if (clockwise)
 *                         element.rotation += speed * t.deltaTime
 *                     else
 *                         element.rotation -= speed * t.deltaTime
 *                 }
 *             })
 *     }
 * }
 * ```
 */
export default abstract class TickerBase<TArgs extends TickerArgs> implements Ticker<TArgs> {
    /**
     * @param args The arguments that you want to pass to the ticker.
     * @param options The options of the ticker.
     */
    constructor(
        args: TArgs,
        options?: {
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
             * The aliases of the canvas elements that are connected to this ticker. This is used by the system to know which canvas elements are connected to this ticker, and to pass them to the fn method. @default []
             */
            canvasElementAliases?: string[];
        },
    ) {
        this.alias = this.constructor.prototype.id;
        const {
            duration,
            priority,
            id = this.generateTickerId(this.alias, options),
            canvasElementAliases = [],
        } = options || {};
        this.args = args;
        this.duration = duration;
        this.priority = priority;
        this.id = id;
        this.canvasElementAliases = canvasElementAliases;
    }
    readonly alias: TickerIdType;
    readonly id: string;
    args: TArgs;
    duration?: number;
    priority?: UPDATE_PRIORITY;
    protected ticker = new PIXI.Ticker();
    canvasElementAliases: string[] = [];
    private generateTickerId(...args: any[]): string {
        try {
            return sha1(JSON.stringify(args)).toString() + "_" + Math.random().toString(36).substring(7);
        } catch (e) {
            throw new Error(`[Pixi’VN] Error to generate ticker id: ${e}`);
        }
    }
    /**
     * The method that will be called every frame.
     * This method should be overridden and you can use {@link canvas.add()} to get the canvas element of the canvas, and edit them.
     * @param _ticker The ticker that is calling this method
     * @param _args The arguments that you passed when you added the ticker
     * @param _alias The alias of the canvas elements that are connected to this ticker
     * @param _tickerId The id of the ticker. You can use this to get the ticker from the {@link canvas.currentTickers}
     */
    abstract fn(_ticker: TickerValue, _args: TArgs, _alias: string | string[], _tickerId: string): void;
    protected fnValue?: () => void;
    complete(_options?: { ignoreTickerSteps?: boolean }) {
        this.stop();
    }
    stop() {
        const fnValue = this.fnValue;
        if (!fnValue) {
            logger.warn("TickerBase.stop() called without fnValue set. This may cause issues.");
            return;
        }
        this.ticker.remove(fnValue, null);
    }
    start() {
        const id = this.id;
        const fnValue = () => {
            const { createdByTicketSteps } = CanvasManagerStatic._currentTickers[id];
            let canvasElementAliases = this.canvasElementAliases;
            if (createdByTicketSteps) {
                if (canvas.isTickerPaused(createdByTicketSteps.canvasElementAlias, createdByTicketSteps.id)) {
                    return;
                }
            } else {
                canvasElementAliases = canvasElementAliases.filter((alias) => !canvas.isTickerPaused(alias, id));
            }
            return this.fn(this.ticker, this.args, canvasElementAliases, id);
        };
        this.fnValue = fnValue;
        this.ticker.add(fnValue, null, this.priority);
        this.ticker.start();
    }
    pause() {
        this.ticker.stop();
    }
    play() {
        this.ticker.start();
    }
    get paused(): boolean {
        return !this.ticker.started;
    }
}
