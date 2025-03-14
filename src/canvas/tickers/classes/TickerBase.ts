import { UPDATE_PRIORITY } from "pixi.js";
import { canvas } from "../..";
import { TickerArgs } from "../../../interfaces";
import Ticker from "../../../interfaces/Ticker";
import { TickerIdType } from "../../../types/TickerIdType";
import tickerDecorator, { getTickerInstanceById } from "../decorators/ticker-decorator";
import TickerValue from "./TickerValue";

/**
 * A class is used to create a ticker element to add into a Pixi Application.
 * You can use {@link canvas.addTicker()} to add this element into the application.
 * This class should be extended and the fn method should be overridden.
 * You must use the {@link tickerDecorator} to register the ticker in the game.
 * In Ren'Py is a transform.
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
export default class TickerBase<TArgs extends TickerArgs> implements Ticker<TArgs> {
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
     * Get the id of the ticker. This variable is used in the system to get the ticker by id, {@link getTickerInstanceById}
     */
    id: TickerIdType = "ticker_id_not_set";
    args: TArgs;
    duration?: number;
    priority?: UPDATE_PRIORITY;
    /**
     * The method that will be called every frame.
     * This method should be overridden and you can use {@link canvas.add()} to get the canvas element of the canvas, and edit them.
     * @param _ticker The ticker that is calling this method
     * @param _args The arguments that you passed when you added the ticker
     * @param _alias The alias of the canvas elements that are connected to this ticker
     * @param _tickerId The id of the ticker. You can use this to get the ticker from the {@link canvas.currentTickers}
     */
    fn(_ticker: TickerValue, _args: TArgs, _alias: string | string[], _tickerId: string): void {
        throw new Error("[Pixi’VN] The method TickerBase.fn() must be overridden");
    }
    /**
     * This method is called when the ticker is added to the canvas.
     * @param alias The alias of the canvas elements that are connected to this ticker
     * @param tickerId The id of the ticker. You can use this to get the ticker from the {@link canvas.currentTickers}
     * @param options The options that you passed when you added the ticker
     */
    public onEndOfTicker(_alias: string | string[], tickerId: string, args: TArgs) {
        let aliasToRemoveAfter: string | string[] =
            ("aliasToRemoveAfter" in args && (args.aliasToRemoveAfter as any)) || [];
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        let tickerAliasToResume: string | string[] =
            ("tickerAliasToResume" in args && (args.tickerAliasToResume as any)) || [];
        if (typeof tickerAliasToResume === "string") {
            tickerAliasToResume = [tickerAliasToResume];
        }
        canvas.onEndOfTicker(tickerId, {
            aliasToRemoveAfter: aliasToRemoveAfter,
            tickerAliasToResume: tickerAliasToResume,
        });
    }
}
