import { Container as PixiContainer } from "pixi.js";
import { TickerValue } from "../..";
import { tickerDecorator } from "../../decorators";
import { checkIfTextureNotIsEmpty } from "../../functions/canvas/ticker-utility";
import { updateTickerProgression } from "../../functions/ticker-utility";
import { canvas } from "../../managers";
import { RotateTickerProps } from "../../types/ticker/RotateTickerProps";
import TickerBase from "./TickerBase";

/**
 * A ticker that rotates the canvas element of the canvas. For centre rotation, set the anchor of the canvas element to 0.5.
 * This ticker can be used on all canvas elements that extend the {@link PixiContainer} class.
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
        ticker: TickerValue,
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
                    if (clockwise)
                        element.rotation += speed * ticker.deltaTime
                    else
                        element.rotation -= speed * ticker.deltaTime
                    if (speed < 0.00001 && !(args.speedProgression && args.speedProgression.type == "linear" && args.speedProgression.amt != 0)) {
                        this.onEndOfTicker(alias, tickerId, args)
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
