import { Container as PixiContainer, Sprite as PixiSprite } from "pixi.js";
import { createExportableElement, TickerValue } from "../..";
import { tickerDecorator } from "../../decorators";
import { checkIfTextureNotIsEmpty } from "../../functions/canvas/ticker-utility";
import { updateTickerProgression } from "../../functions/ticker-utility";
import { canvas } from "../../managers";
import { MoveTickerProps } from "../../types/ticker";
import { calculatePositionByAlign, calculatePositionByPercentagePosition } from "../canvas/AdditionalPositions";
import TickerBase from "./TickerBase";

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
        let xSpeed
        let ySpeed
        if (args.speed === undefined) {
            args.speed = 100
        }
        if (typeof args.speed === "number") {
            xSpeed = this.speedConvert(args.speed)
            ySpeed = this.speedConvert(args.speed)
        }
        else {
            xSpeed = this.speedConvert(args.speed.x)
            ySpeed = this.speedConvert(args.speed.y)
        }
        let aliasToRemoveAfter = args.aliasToRemoveAfter || []
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter]
        }
        let tickerAliasToResume = args.tickerAliasToResume || []
        if (typeof tickerAliasToResume === "string") {
            tickerAliasToResume = [tickerAliasToResume]
        }
        aliases
            .filter((alias) => {
                let element = canvas.find(alias)
                if (!element) {
                    return false
                }
                if (args.startOnlyIfHaveTexture) {
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
                    let xDistance = (destination.x - element.x) > 0 ? 1 : -1
                    if (xDistance != 0 && xSpeed > 0) {
                        element.x += xDistance * xSpeed * ticker.deltaTime
                        let newDistance = destination.x - element.x
                        if (xDistance < 0 && newDistance > 0 ||
                            xDistance > 0 && newDistance < 0
                        ) {
                            element.x = destination.x
                        }
                    }
                    let yDistance = (destination.y - element.y) > 0 ? 1 : -1
                    if (yDistance != 0 && ySpeed > 0) {
                        element.y += yDistance * ySpeed * ticker.deltaTime
                        let newDistance = destination.y - element.y
                        if (yDistance < 0 && newDistance > 0 ||
                            yDistance > 0 && newDistance < 0
                        ) {
                            element.y = destination.y
                        }
                    }
                    if (element.x == destination.x && element.y == destination.y) {
                        this.onEndOfTicker(alias, tickerId, args)
                    }
                    if (xSpeed <= 0 && ySpeed <= 0) {
                        console.warn("[Pixi’VN] The speed of the MoveTicker must be greater than 0.")
                        this.onEndOfTicker(alias, tickerId, args, { editPosition: false })
                    }
                }
            })
        if (args.speedProgression)
            updateTickerProgression(args, "speed", args.speedProgression, this.speedConvert)
    }
    override onEndOfTicker(
        alias: string | string[],
        tickerId: string,
        args: MoveTickerProps,
        options: { editPosition: boolean } = { editPosition: true }
    ): void {
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
                if (args.isPushInOut && element.children.length > 0) {
                    let elementChild = element.children[0]
                    canvas.add(alias, elementChild as any, { ignoreOldStyle: true })
                }
            }
        })
        super.onEndOfTicker(alias, tickerId, args)
    }
    private speedConvert(speed: number): number {
        return speed / 6
    }
}
