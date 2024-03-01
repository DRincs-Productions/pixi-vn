import { tickerDecorator } from "../../decorators/TickerDecorator";
import { GameWindowManager } from "../../managers/WindowManager";
import { TickerClass } from "../TickerClass";
import { CanvasSprite } from "../canvas/CanvasSprite";

/**
 * A ticker that rotates the children of the canvas.
 */
@tickerDecorator()
export class RotateTicker extends TickerClass<{ speed?: number, clockwise?: boolean }> {
    /**
     * The method that will be called every frame to rotate the children of the canvas.
     * @param delta The delta time
     * @param args The arguments that are passed to the ticker
     * - speed: The speed of the rotation, default is 0.1
     * @param childTags The tags of the children that are connected to this ticker
     */
    override fn(delta: number, args: { speed?: number, clockwise?: boolean }, childTags: string[]): void {
        let speed = args.speed || 0.1
        let clockwise = args.clockwise === undefined ? true : args.clockwise
        childTags.forEach((tag) => {
            let element = GameWindowManager.getChild(tag)
            if (element && element instanceof CanvasSprite) {
                if (clockwise)
                    element.rotation += speed * delta;
                else
                    element.rotation -= speed * delta;
            }
        })
    }
}
