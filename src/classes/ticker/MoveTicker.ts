import { Container as PixiContainer, Sprite as PixiSprite } from "pixi.js";
import { createExportableElement, TickerValue } from "../..";
import { tickerDecorator } from "../../decorators";
import { checkIfTextureNotIsEmpty } from "../../functions/canvas/ticker-utility";
import { updateTickerProgression } from "../../functions/ticker-utility";
import { canvas } from "../../managers";
import { MoveTickerProps } from "../../types/ticker";
import { calculatePositionByAlign, calculatePositionByPercentagePosition } from "../canvas/AdditionalPositions";
import TickerBase from "./TickerBase";

const DEFAULT_SPEED = 10

function calculateDestination<T extends PixiContainer>(args: MoveTickerProps, element: T) {
    let destination = createExportableElement(args.destination)
    if (destination.type === "align") {
        let anchorx = undefined
        let anchory = undefined
        if (element instanceof PixiSprite) {
            anchorx = element.anchor.x
            anchory = element.anchor.y
        }
        destination.x = calculatePositionByAlign("width", destination.x, element.width, element.pivot.x, anchorx)
        destination.y = calculatePositionByAlign("height", destination.y, element.height, element.pivot.y, anchory)
    }
    if (destination.type === "percentage") {
        destination.x = calculatePositionByPercentagePosition("width", destination.x)
        destination.y = calculatePositionByPercentagePosition("height", destination.y)
    }
    return destination
}

/**
 * A ticker that moves the canvas element of the canvas.
 * This ticker can be used on all canvas elements that extend the {@link PixiContainer} class.
 * @example
 * ```typescript
 * let alien = addImage("alien", 'https://pixijs.com/assets/eggHead.png')
 * canvas.add("alien", alien);
 * const ticker = new MoveTicker({
 *    speed: 0.1,
 *    destination: { x: 100, y: 100 },
 * }),
 * ```
 */
@tickerDecorator()
export default class MoveTicker extends TickerBase<MoveTickerProps> {
    override fn(
        ticker: TickerValue,
        args: MoveTickerProps,
        aliases: string[],
        tickerId: string
    ): void {
        if (args.speed === undefined) {
            args.speed = DEFAULT_SPEED
        }

        const { speed, startOnlyIfHaveTexture, speedProgression } = args

        aliases
            .filter((alias) => {
                let element = canvas.find(alias)
                if (!element) {
                    return false
                }
                if (startOnlyIfHaveTexture) {
                    if (!checkIfTextureNotIsEmpty(element)) {
                        return false
                    }
                }
                return true
            })
            .forEach((alias) => {
                let element = canvas.find(alias)
                if (element && element instanceof PixiContainer) {
                    let destination = calculateDestination(args, element)
                    let xDistance = (destination.x - element.x)
                    let yDistance = (destination.y - element.y)
                    let xStep: 1 | -1 = xDistance > 0 ? 1 : -1
                    let yStep: 1 | -1 = yDistance > 0 ? 1 : -1

                    let xSpeed
                    let ySpeed
                    if (typeof speed === "number") {
                        let s = this.speedConvert(speed)
                        if (xDistance === 0 || yDistance === 0) {
                            xSpeed = ySpeed = s
                        }
                        else {
                            xSpeed = Math.abs(xDistance / (xDistance + yDistance)) * s
                            ySpeed = Math.abs(yDistance / (xDistance + yDistance)) * s
                        }
                    }
                    else {
                        xSpeed = this.speedConvert(speed.x)
                        ySpeed = this.speedConvert(speed.y)
                    }

                    if (xSpeed > 0) {
                        element.x += xStep * xSpeed * ticker.deltaTime
                        let newDistance = destination.x - element.x
                        if (xStep < 0 && newDistance > 0 ||
                            xStep > 0 && newDistance < 0
                        ) {
                            element.x = destination.x
                        }
                    }
                    if (ySpeed > 0) {
                        element.y += yStep * ySpeed * ticker.deltaTime
                        let newDistance = destination.y - element.y
                        if (yStep < 0 && newDistance > 0 ||
                            yStep > 0 && newDistance < 0
                        ) {
                            element.y = destination.y
                        }
                    }
                    if (element.x == destination.x && element.y == destination.y) {
                        this.onEndOfTicker(alias, tickerId, args)
                        return
                    }
                    else if (xSpeed < 0.00001 && ySpeed < 0.00001 && !(speedProgression && speedProgression.type == "linear" && speedProgression.amt != 0)) {
                        console.warn("[Pixi’VN] The speed of the MoveTicker must be greater than 0.")
                        this.onEndOfTicker(alias, tickerId, args, { editPosition: false })
                        return
                    }
                }
            })
        if (speedProgression)
            updateTickerProgression(args, "speed", speedProgression)
    }
    override onEndOfTicker(
        alias: string | string[],
        tickerId: string,
        args: MoveTickerProps,
        options: { editPosition: boolean } = { editPosition: true }
    ): void {
        const { isPushInOut } = args
        if (typeof alias === "string") {
            alias = [alias]
        }
        alias.forEach((alias) => {
            let element = canvas.find(alias)
            if (element) {
                let destination = calculateDestination(args, element)
                if (options.editPosition) {
                    element.x = destination.x
                    element.y = destination.y
                }
                if (isPushInOut && element.children.length > 0) {
                    let elementChild = element.children[0]
                    canvas.add(alias, elementChild as any, { ignoreOldStyle: true })
                }
            }
        })
        super.onEndOfTicker(alias, tickerId, args)
    }
    private speedConvert(speed: number): number {
        return speed * (66 / 400)
    }
}
