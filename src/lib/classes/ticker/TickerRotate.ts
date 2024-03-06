import { tickerDecorator } from "../../decorators/TickerDecorator";
import { updateTickerProgression } from "../../functions/TickerUtility";
import { TickerProgrationType } from "../../interface/ITickerProgration";
import { GameWindowManager } from "../../managers/WindowManager";
import { CanvasSprite } from "../canvas/CanvasSprite";
import { TickerBase } from "./TickerBase";

/**
 * A ticker that rotates the children of the canvas.
 * @param args The arguments that are passed to the ticker
 * - speed: The speed of the rotation, default is 0.1
 * - clockwise: The direction of the rotation, default is true
 * - speedProgression: The progression of the speed
 * @param duration The duration of the ticker
 * @param priority The priority of the ticker
 */
@tickerDecorator()
export class TickerRotate extends TickerBase<{ speed?: number, clockwise?: boolean, speedProgression?: TickerProgrationType }> {
    /**
     * The method that will be called every frame to rotate the children of the canvas.
     * @param delta The delta time
     * @param args The arguments that are passed to the ticker
     * @param childTags The tags of the children that are connected to this ticker
     */
    override fn(
        delta: number,
        args: {
            speed?: number,
            clockwise?: boolean,
            speedProgression?: TickerProgrationType,
        },
        childTags: string[]
    ): void {
        let speed = args.speed === undefined ? 0.1 : args.speed
        let clockwise = args.clockwise === undefined ? true : args.clockwise
        childTags.forEach((tag) => {
            let element = GameWindowManager.getCanvasElement(tag)
            if (element && element instanceof CanvasSprite) {
                if (clockwise)
                    element.rotation += speed * delta;
                else
                    element.rotation -= speed * delta;
            }
        })
        if (args.speedProgression)
            updateTickerProgression(args, "speed", args.speedProgression)
    }
}
