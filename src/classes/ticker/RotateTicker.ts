import { Container, Sprite, Ticker } from "pixi.js";
import { tickerDecorator } from "../../decorators";
import { updateTickerProgression } from "../../functions/TickerUtility";
import { canvas } from "../../managers";
import { RotateTickerProps } from "../../types/ticker/RotateTickerProps";
import TickerBase from "./TickerBase";

/**
 * A ticker that rotates the canvas element of the canvas. For centre rotation, set the anchor of the canvas element to 0.5.
 * This ticker can be used on all canvas elements that extend the {@link Container} class.
 * @example
 * ```typescript
 * let alien = addImage("alien", 'https://pixijs.com/assets/eggHead.png')
 * alien.anchor.set(0.5);
 * canvas.add("alien", alien);
 * const ticker = new RotateTicker({
 *    speed: 0.1,
 *    clockwise: true,
 * }),
 * canvas.addTicker("alien", ticker)
 * ```
 */
@tickerDecorator()
export default class RotateTicker extends TickerBase<RotateTickerProps> {
    override fn(
        ticker: Ticker,
        args: RotateTickerProps,
        aliases: string[],
        tickerId: string
    ): void {
        let speed = this.speedConvert(args.speed === undefined ? 1 : args.speed)
        let clockwise = args.clockwise === undefined ? true : args.clockwise
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
                    if (clockwise)
                        element.rotation += speed * ticker.deltaTime
                    else
                        element.rotation -= speed * ticker.deltaTime
                    if (speed < 0.00001 && !(args.speedProgression && args.speedProgression.type == "linear" && args.speedProgression.amt != 0)) {
                        canvas.onEndOfTicker(alias, this, tickerId, {
                            aliasToRemoveAfter: aliasToRemoveAfter,
                            tickerAliasToResume: tickerAliasToResume,
                        })
                    }
                }
            })
        if (args.speedProgression)
            updateTickerProgression(args, "speed", args.speedProgression, this.speedConvert)
    }
    private speedConvert(speed: number): number {
        return speed / 60
    }
}
