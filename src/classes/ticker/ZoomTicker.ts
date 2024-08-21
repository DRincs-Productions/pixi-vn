import { Container, ContainerChild, Sprite, Ticker, UPDATE_PRIORITY } from "pixi.js";
import { tickerDecorator } from "../../decorators";
import { updateTickerProgression } from "../../functions/TickerUtility";
import { canvas } from "../../managers";
import { ZoomTickerProps } from "../../types/ticker";
import TickerBase from "./TickerBase";

/**
 * A ticker that zooms the canvas element of the canvas.
 * This ticker can be used on all canvas elements that extend the {@link Container} class.
 * @example
 * ```typescript
 * let alien = addImage("alien", 'https://pixijs.com/assets/eggHead.png')
 * alien.anchor.set(0.5);
 * canvas.add("alien", alien);
 * const ticker = new ZoomTicker({
 *    speed: 0.1,
 * }),
 * canvas.addTicker("alien", ticker)
 * ```
 */
@tickerDecorator()
export default class ZoomTicker extends TickerBase<ZoomTickerProps> {
    override fn(
        ticker: Ticker,
        args: ZoomTickerProps,
        alias: string[],
        tickerId: string
    ): void {
        let xSpeed = 0.1
        let ySpeed = 0.1
        if (args.speed) {
            if (typeof args.speed === "number") {
                xSpeed = this.speedConvert(args.speed)
                ySpeed = this.speedConvert(args.speed)
            }
            else {
                xSpeed = this.speedConvert(args.speed.x)
                ySpeed = this.speedConvert(args.speed.y)
            }
        }
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
        alias
            .filter((alias) => {
                let element = canvas.find(alias)
                if (args.startOnlyIfHaveTexture) {
                    if (element && element instanceof Sprite && element.texture?.label == "EMPTY") {
                        return false
                    }
                }
                return true
            })
            .forEach((alias) => {
                let element = canvas.find(alias)
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
                            this.onEndOfTicker(alias, tickerId, element, tagToRemoveAfter)
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
                            this.onEndOfTicker(alias, tickerId, element, tagToRemoveAfter)
                        }
                    }
                    if (xSpeed < 0.00001 && ySpeed < 0.00001 && !(args.speedProgression && args.speedProgression.type == "linear" && args.speedProgression.amt != 0)) {
                        this.onEndOfTicker(alias, tickerId, element, tagToRemoveAfter)
                    }
                }
            })
        if (args.speedProgression)
            updateTickerProgression(args, "speed", args.speedProgression, this.speedConvert)
    }
    private speedConvert(speed: number): number {
        return speed / 60
    }

    onEndOfTicker<T extends Container = Container>(
        alias: string,
        tickerId: string,
        _element: T,
        tagToRemoveAfter: string[] | string,
    ): void {
        canvas.onEndOfTicker(alias, this, tagToRemoveAfter, tickerId)
    }
}


export class ZoomInOutTicker extends ZoomTicker {
    constructor(props: ZoomTickerProps, duration?: number, priority?: UPDATE_PRIORITY) {
        super(props, duration, priority)
    }
    override onEndOfTicker<T extends Container = Container<ContainerChild>>(alias: string, tickerId: string, element: T, tagToRemoveAfter: string[] | string): void {
        if (element.children.length > 0) {
            let elementChild = element.children[0]
            canvas.add(alias, elementChild as any)
        }
        super.onEndOfTicker(alias, tickerId, element, tagToRemoveAfter)
    }
}
