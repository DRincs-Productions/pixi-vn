import { Ticker as PixiTicker, UPDATE_PRIORITY } from "pixi.js";
import { canvas, CanvasManagerStatic, Ticker } from "../..";
import { logger } from "../../../utils/log-utility";
import { TickerIdType } from "../../types/TickerIdType";
import RegisteredTickers, { tickerDecorator } from "../decorators/RegisteredTickers";
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
     * @param duration The duration of the ticker in seconds. If is undefined, the step will end only when the animation is finished (if the animation doesn't have a goal to reach then it won't finish). @default undefined
     * @param priority The priority of the ticker. @default UPDATE_PRIORITY.NORMAL
     */
    constructor(args: TArgs, duration?: number, priority?: UPDATE_PRIORITY) {
        this.args = args;
        this.duration = duration;
        this.priority = priority;
        this.id = this.constructor.prototype.id;
    }
    /**
     * Get the id of the ticker. This variable is used in the system to get the ticker by id, {@link RegisteredTickers.getInstance}
     */
    id: TickerIdType = "ticker_id_not_set";
    args: TArgs;
    duration?: number;
    priority?: UPDATE_PRIORITY;
    protected ticker = new PixiTicker();
    protected tickerId?: string;
    canvasElementAliases: string[] = [];
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
    /**
     * This method is called when the ticker is added to the canvas.
     * @param alias The alias of the canvas elements that are connected to this ticker
     * @param tickerId The id of the ticker. You can use this to get the ticker from the {@link canvas.currentTickers}
     * @param options The options that you passed when you added the ticker
     */
    public onComplete(_alias: string | string[], _tickerId: string, _args: TArgs) {}
    complete(options?: { ignoreTickerSteps?: boolean }) {
        const { ignoreTickerSteps } = options || {};
        const id = this.tickerId;
        if (!id) {
            logger.warn("TickerBase.complete() called without tickerId set. This may cause issues.");
            return;
        }
        this.onComplete(this.canvasElementAliases, id, this.args);
        let aliasToRemoveAfter: string | string[] =
            ("aliasToRemoveAfter" in this.args && (this.args.aliasToRemoveAfter as any)) || [];
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        let tickerAliasToResume: string | string[] =
            ("tickerAliasToResume" in this.args && (this.args.tickerAliasToResume as any)) || [];
        if (typeof tickerAliasToResume === "string") {
            tickerAliasToResume = [tickerAliasToResume];
        }
        let tickerIdToResume: string | string[] =
            ("tickerIdToResume" in this.args && (this.args.tickerIdToResume as any)) || [];
        if (typeof tickerIdToResume === "string") {
            tickerIdToResume = [tickerIdToResume];
        }
        canvas.onTickerComplete(id, {
            aliasToRemoveAfter: aliasToRemoveAfter,
            tickerAliasToResume: tickerAliasToResume,
            tickerIdToResume: tickerIdToResume,
            ignoreTickerSteps: ignoreTickerSteps,
        });
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
    start(id: string) {
        this.tickerId = id;
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
