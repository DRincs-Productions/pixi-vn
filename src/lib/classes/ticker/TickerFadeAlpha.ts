import { tickerDecorator } from "../../decorators/TickerDecorator";
import { GameWindowManager } from "../../managers/WindowManager";
import { CanvasSprite } from "../canvas/CanvasSprite";
import { TickerBase } from "./TickerBase";

/**
 * A ticker that fades the alpha of the canvas element of the canvas.
 * @param args The arguments that are passed to the ticker
 * - speed: The speed of the fade
 * - type: The type of the fade, default is "hide"
 * - limit: The limit of the fade, default is 0 for hide and 1 for show
 * - tagToRemoveAfter?: The tag to remove after the fade is done
 * @param duration The duration of the ticker
 * @param priority The priority of the ticker
 */
@tickerDecorator()
export class TickerFadeAlpha extends TickerBase<{ speed: number, type?: "hide" | "show", limit?: number, tagToRemoveAfter?: string[] | string }> {
    /**
     * The method that will be called every frame to fade the alpha of the canvas element of the canvas.
     * @param delta The delta time
     * @param args The arguments that are passed to the ticker
     * @param tags The tags of the canvas element that are connected to this ticker
     */
    override fn(
        delta: number,
        args: {
            speed?: number,
            type?: "hide" | "show",
            limit?: number,
            tagToRemoveAfter?: string[] | string
        },
        tags: string[]
    ): void {
        let type = args.type === undefined ? "hide" : args.type
        let speed = args.speed === undefined ? 0.1 : args.speed
        let limit = args.limit === undefined ? type === "hide" ? 0 : 1 : args.limit
        let removeElementAfter = args.tagToRemoveAfter || []
        if (typeof removeElementAfter === "string") {
            removeElementAfter = [removeElementAfter]
        }
        if (type === "hide" && limit < 0) {
            limit = 0
        }
        if (type === "show" && limit > 1) {
            limit = 1
        }
        tags.forEach((tag) => {
            let element = GameWindowManager.getCanvasElement(tag)
            if (element && element instanceof CanvasSprite) {
                if (type === "show" && element.alpha < limit) {
                    element.alpha += speed * delta
                }
                else if (type === "hide" && element.alpha > limit) {
                    element.alpha -= speed * delta
                }
                else {
                    element.alpha = limit
                    GameWindowManager.removeAssociationBetweenTickerCanvasElement(tag, this)
                    GameWindowManager.removeCanvasElement(removeElementAfter)
                }
            }
        })
    }
}
