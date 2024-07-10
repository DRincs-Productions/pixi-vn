import { Ticker, UPDATE_PRIORITY } from "pixi.js"
import { tickerDecorator } from "../../decorators"
import ITicker from "../../interface/ITicker"
import { StorageElementType } from "../../types/StorageElementType"

export type TickerArgsType = { [id: string]: StorageElementType } | {
    tagToRemoveAfter?: string[] | string,
    [id: string]: StorageElementType
}[]

/**
 * A class is used to create a ticker element to add into a Pixi Application.
 * You can use GameWindowManager.addTicker() to add this element into the application.
 * This class should be extended and the fn method should be overridden.
 * You must use the {@link tickerDecorator} to register the ticker in the game.
 * In Ren'Py is a transform.
 * @example
 * ```typescript
 * \@tickerDecorator() // this is equivalent to tickerDecorator("TickerRotate")
 * export class TickerRotate extends TickerBase<{ speed?: number }> {
 *     override fn(
 *         t: Ticker,
 *         args: {
 *             speed?: number,
 *         },
 *         tags: string[]
 *     ): void {
 *         let speed = args.speed === undefined ? 0.1 : args.speed
 *         tags.forEach((tag) => {
 *                 let element = GameWindowManager.getCanvasElement(tag)
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
export default class TickerBase<TArgs extends TickerArgsType> implements ITicker<TArgs> {
    /**
     * @param args The arguments that you want to pass to the ticker.
     * @param duration The duration of the ticker in seconds. If is undefined, the ticker will be called every frame. @default undefined
     * @param priority The priority of the ticker. @default UPDATE_PRIORITY.NORMAL
     */
    constructor(args: TArgs, duration?: number, priority?: UPDATE_PRIORITY) {
        this.args = args
        this.duration = duration
        this.priority = priority
    }
    args: TArgs
    duration?: number
    priority?: UPDATE_PRIORITY
    /**
     * The method that will be called every frame.
     * This method should be overridden and you can use GameWindowManager.addCanvasElement() to get the canvas element of the canvas, and edit them.
     * @param t The ticker that is calling this method
     * @param args The arguments that you passed when you added the ticker
     * @param tags The tags of the canvas elements that are connected to this ticker
     */
    fn(_t: Ticker, _args: TArgs, _tags: string | string[]): void { throw new Error("[Pixi'VN] The method TickerBase.fn() must be overridden") }
}
