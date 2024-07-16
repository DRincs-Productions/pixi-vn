import { Container, ContainerChild, Sprite, Ticker, UPDATE_PRIORITY } from "pixi.js";
import { tickerDecorator } from "../../decorators";
import { updateTickerProgression } from "../../functions/TickerUtility";
import { GameWindowManager } from "../../managers";
import { ZoomTickerProps } from "../../types/ticker";
import TickerBase from "./TickerBase";

/**
 * A ticker that zooms the canvas element of the canvas.
 * This ticker can be used on all canvas elements that extend the {@link Container} class.
 * @example
 * ```typescript
 * let alien = addImage("alien", 'https://pixijs.com/assets/eggHead.png')
 * alien.anchor.set(0.5);
 * GameWindowManager.addCanvasElement("alien", alien);
 * const ticker = new ZoomTicker({
 *    speed: 0.1,
 * }),
 * GameWindowManager.addTicker("alien", ticker)
 * ```
 */
@tickerDecorator()
export default class ZoomTicker extends TickerBase<ZoomTickerProps> {
    override fn(
        ticker: Ticker,
        args: ZoomTickerProps,
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
        let xLimit = type === "zoom" ? Infinity : 0
        let yLimit = type === "zoom" ? Infinity : 0
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
                            this.onEndOfTicker(tag, tickerId, element, tagToRemoveAfter)
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
                            this.onEndOfTicker(tag, tickerId, element, tagToRemoveAfter)
                        }
                    }
                    if (xSpeed < 0.00001 && ySpeed < 0.00001 && !(args.speedProgression && args.speedProgression.type == "linear" && args.speedProgression.amt != 0)) {
                        this.onEndOfTicker(tag, tickerId, element, tagToRemoveAfter)
                    }
                }
            })
        if (args.speedProgression)
            updateTickerProgression(args, "speed", args.speedProgression)
    }

    onEndOfTicker<T extends Container = Container>(
        tag: string,
        tickerId: string,
        _element: T,
        tagToRemoveAfter: string[] | string,
    ): void {
        GameWindowManager.onEndOfTicker(tag, this, tagToRemoveAfter, tickerId)
    }
}


export class ZoomInOutTicker extends ZoomTicker {
    constructor(tagChild: string, props: ZoomTickerProps, duration?: number, priority?: UPDATE_PRIORITY) {
        super(props, duration, priority)
        this.tagChild = tagChild
    }
    tagChild: string
    override onEndOfTicker<T extends Container = Container<ContainerChild>>(conteinerTag: string, tickerId: string, element: T, tagToRemoveAfter: string[] | string): void {
        let elementChild = GameWindowManager.getCanvasElement(this.tagChild)
        element.removeChildren()
        if (elementChild) {
            GameWindowManager.addCanvasElement(this.tagChild, elementChild)
        }
        GameWindowManager.removeCanvasElement(conteinerTag)
        super.onEndOfTicker(conteinerTag, tickerId, element, tagToRemoveAfter)
    }
}
