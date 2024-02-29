import { tickerDecorator } from "../../decorators/TickerDecorator";
import { GameWindowManager } from "../../managers/WindowManager";
import { TickerClass } from "../TickerClass";
import { CanvasSprite } from "../canvas/CanvasSprite";

/**
 * A ticker that rotates the children of the canvas.
 */
@tickerDecorator()
export class RotateTicker extends TickerClass<{ speed: number }> {
    /**
     * The method that will be called every frame to rotate the children of the canvas.
     * @param delta The delta time
     * @param args { speed: number } The speed of the rotation
     * @param childTags The tags of the children that are connected to this ticker
     */
    override fn(delta: number, args: { speed: number }, childTags: string[]): void {
        childTags.forEach((tag) => {
            let element = GameWindowManager.getChild(tag)
            if (element && element instanceof CanvasSprite) {
                element.rotation += args.speed * delta;
            }
        })
    }
}
