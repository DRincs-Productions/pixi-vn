import { UPDATE_PRIORITY } from "pixi.js"
import { ITicker } from "../../interface/ITicker"
import { StorageElementType } from "../../types/StorageElementType"

export type TickerArgsType = { [tag: string]: StorageElementType }

/**
 * A class is used to create a ticker element to add into a Pixi Application.
 * You can use GameWindowManager.addTicker() to add this element into the application.
 * This class should be extended and the fn method should be overridden.
 * In Ren'Py is a transform.
 */
export class TickerBase<TArgs extends TickerArgsType> implements ITicker<TArgs> {
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
     * This method should be overridden and you can use GameWindowManager.getChild() to get the children of the canvas, and edit them.
     * @param dt Delta time
     * @param args The arguments that you passed when you added the ticker
     * @param childTags The tags of the children that are connected to this ticker
     */
    fn(_dt: number, _args: TArgs, _childTags: string | string[]): void {
        throw new Error("This method should be overridden")
    }
}