import { Container, Sprite } from "pixi.js";
import { TickerValue } from "../..";
import { tickerDecorator } from "../../decorators";
import { updateTickerProgression } from "../../functions/ticker-utility";
import { canvas } from "../../managers";
import { MoveTickerProps } from "../../types/ticker";
import TickerBase from "./TickerBase";

/**
 * A ticker that moves the canvas element of the canvas.
 * This ticker can be used on all canvas elements that extend the {@link Container} class.
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
        let xSpeed = 1
        let ySpeed = 1
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
        let destination = args.destination
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
                    let xDistance = (destination.x - element.x) > 0 ? 1 : -1
                    if (xDistance != 0) {
                        element.x += xDistance * xSpeed * ticker.deltaTime
                        let newDistance = destination.x - element.x
                        if (xDistance < 0 && newDistance > 0 ||
                            xDistance > 0 && newDistance < 0
                        ) {
                            element.x = destination.x
                        }
                    }
                    let yDistance = (destination.y - element.y) > 0 ? 1 : -1
                    if (yDistance != 0) {
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
                }
            })
        if (args.speedProgression)
            updateTickerProgression(args, "speed", args.speedProgression, this.speedConvert)
    }
    override onEndOfTicker(
        alias: string | string[],
        tickerId: string,
        args: MoveTickerProps,
    ): void {
        if (typeof alias === "string") {
            alias = [alias]
        }
        alias.forEach((alias) => {
            let element = canvas.find(alias)
            if (element) {
                let destination = args.destination
                element.x = destination.x
                element.y = destination.y
            }
        })
        super.onEndOfTicker(alias, tickerId, args)
    }
    private speedConvert(speed: number): number {
        return speed / 6
    }
}
