import { Container, Sprite, Ticker } from "pixi.js";
import { tickerDecorator } from "../../decorators";
import { updateTickerProgression } from "../../functions/TickerUtility";
import { GameWindowManager } from "../../managers";
import { TickerZoomProps } from "../../types/ticker";
import TickerBase from "./TickerBase";

/**
 * A ticker that zooms the canvas element of the canvas.
 * This ticker can be used on all canvas elements that extend the {@link Container} class.
 * @example
 * ```typescript
 * let alien = addImage("alien", 'https://pixijs.com/assets/eggHead.png')
 * alien.anchor.set(0.5);
 * GameWindowManager.addCanvasElement("alien", alien);
 * const ticker = new TickerZoom({
 *    speed: 0.1,
 * }),
 * GameWindowManager.addTicker("alien", ticker)
 * ```
 */
@tickerDecorator()
export default class TickerZoom extends TickerBase<TickerZoomProps> {
    override fn(
        ticker: Ticker,
        args: TickerZoomProps,
        tags: string[],
        tickerId: string
    ): void {
        let xSpeed = 0.1
        let ySpeed = 0.1
        if (args.speed) {
            if (typeof args.speed === "number") {
                xSpeed = args.speed
                ySpeed = args.speed
            }
            else {
                xSpeed = args.speed.x
                ySpeed = args.speed.y
            }
        }
        xSpeed /= 60
        ySpeed /= 60
        let tagToRemoveAfter = args.tagToRemoveAfter || []
        if (typeof tagToRemoveAfter === "string") {
            tagToRemoveAfter = [tagToRemoveAfter]
        }
        let type = args.type || "zoom"
        let xLimit = Infinity
        let yLimit = Infinity
        if (args.limit) {
            if (typeof args.limit === "number") {
                xLimit = args.limit
                yLimit = args.limit
            }
            else {
                xLimit = args.limit.x
                yLimit = args.limit.y
            }
        }
        tags
            .filter((tag) => {
                let element = GameWindowManager.getCanvasElement(tag)
                if (args.startOnlyIfHaveTexture) {
                    if (element && element instanceof Sprite && element.texture?.label == "EMPTY") {
                        return false
                    }
                }
                return true
            })
            .forEach((tag) => {
                let element = GameWindowManager.getCanvasElement(tag)
                if (element && element instanceof Container) {
                    if (
                        type === "zoom"
                        && (element.scale.x < xLimit || element.scale.y < yLimit)
                    ) {
                        element.scale.x += xSpeed * ticker.deltaTime
                        element.scale.y += ySpeed * ticker.deltaTime
                    }
                    else if (
                        type === "unzoom"
                        && (element.scale.x > xLimit || element.scale.y > yLimit)
                    ) {
                        element.scale.x -= xSpeed * ticker.deltaTime
                        element.scale.y -= ySpeed * ticker.deltaTime
                    }
                    if (type === "zoom") {
                        if (element.scale.x > xLimit) {
                            element.scale.x = xLimit
                        }
                        if (element.scale.y > yLimit) {
                            element.scale.y = yLimit
                        }
                        if (element.scale.x >= xLimit && element.scale.y >= yLimit) {
                            element.scale.x = xLimit
                            element.scale.y = yLimit
                            GameWindowManager.onEndOfTicker(tag, this, tagToRemoveAfter, tickerId)
                        }
                    }
                    else if (type === "unzoom") {
                        if (element.scale.x < xLimit) {
                            element.scale.x = xLimit
                        }
                        if (element.scale.y < yLimit) {
                            element.scale.y = yLimit
                        }
                        if (element.scale.x <= xLimit && element.scale.y <= yLimit) {
                            element.scale.x = xLimit
                            element.scale.y = yLimit
                            GameWindowManager.onEndOfTicker(tag, this, tagToRemoveAfter, tickerId)
                        }
                    }
                    if (xSpeed < 0.00001 && ySpeed < 0.00001 && !(args.speedProgression && args.speedProgression.type == "linear" && args.speedProgression.amt != 0)) {
                        GameWindowManager.onEndOfTicker(tag, this, tagToRemoveAfter, tickerId)
                    }
                }
            })
        if (args.speedProgression)
            updateTickerProgression(args, "speed", args.speedProgression)
    }
}
