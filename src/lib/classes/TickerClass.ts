import { StorageElementType } from "../types/StorageElementType"

export type TickerArgsType = { [tag: string]: StorageElementType }

/**
 * A class is used to create a ticker element to add into a Pixi Application.
 * You can use GameWindowManager.addTicker() to add this element into the application.
 * This class should be extended and the fn method should be overridden.
 */
export class TickerClass<T extends TickerArgsType> {
    constructor(_args: T) { }
    /**
     * The method that will be called every frame.
     * This method should be overridden and you can use GameWindowManager.getChild() to get the children of the canvas, and edit them.
     * @param dt Delta time
     */
    fn(dt: number, args: T): void {
        console.warn("This method should be overridden", dt, args)
        throw new Error("This method should be overridden")
    }
}
