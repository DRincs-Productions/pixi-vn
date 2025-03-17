import { Container as PixiContainer, UPDATE_PRIORITY } from "pixi.js";
import { TickerBase, TickerValue } from "..";
import { canvas } from "../..";
import { logger } from "../../../utils/log-utility";
import { checkIfTextureNotIsEmpty } from "../../functions/ticker-utility";
import { tickerDecoratorFn } from "../decorators/ticker-decorator";
import { updateTickerProgression } from "../functions/ticker-utility";
import { RotateTickerProps } from "../types";

const DEFAULT_SPEED = 1;

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
export default class RotateTicker extends TickerBase<RotateTickerProps> {
    constructor(args: RotateTickerProps = {}, duration?: number, priority?: UPDATE_PRIORITY) {
        super(args, duration, priority);
    }
    override fn(ticker: TickerValue, args: RotateTickerProps, aliases: string[], tickerId: string): void {
        if (args.speed === undefined) {
            args.speed = DEFAULT_SPEED;
        }

        const { clockwise = true, speedProgression, limit } = args;
        const speed = this.speedConvert(args.speed);

        aliases
            .filter((alias) => {
                let element = canvas.find(alias);
                if (!element) {
                    return false;
                }
                if (args.startOnlyIfHaveTexture) {
                    if (!checkIfTextureNotIsEmpty(element)) {
                        return false;
                    }
                }
                return true;
            })
            .forEach((alias) => {
                let element = canvas.find(alias);
                if (element && element instanceof PixiContainer) {
                    if (clockwise) element.rotation += speed * ticker.deltaTime;
                    else element.rotation -= speed * ticker.deltaTime;
                    if (limit !== undefined) {
                        if (clockwise && element.angle >= limit) {
                            element.angle = limit;
                            this.onEndOfTicker(alias, tickerId, args);
                        } else if (!clockwise && element.angle <= limit) {
                            element.angle = limit;
                            this.onEndOfTicker(alias, tickerId, args);
                        }
                    }
                    if (
                        speed < 0.00001 &&
                        !(speedProgression && speedProgression.type == "linear" && speedProgression.amt != 0)
                    ) {
                        logger.warn("The speed of the RotateTicker must be greater than 0.");
                        this.onEndOfTicker(alias, tickerId, args, { editRotation: false });
                        return;
                    }
                }
            });
        if (speedProgression) updateTickerProgression(args, "speed", speedProgression);
    }
    override onEndOfTicker(
        alias: string | string[],
        tickerId: string,
        args: RotateTickerProps,
        options: { editRotation?: boolean } = { editRotation: true }
    ): void {
        const { limit } = args;
        if (typeof alias === "string") {
            alias = [alias];
        }
        alias.forEach((alias) => {
            let element = canvas.find(alias);
            if (element) {
                if (options.editRotation && limit !== undefined) {
                    element.angle = limit;
                }
            }
        });
        super.onEndOfTicker(alias, tickerId, args);
    }
    private speedConvert(speed: number): number {
        return speed / 100;
    }
}
tickerDecoratorFn(RotateTicker);
