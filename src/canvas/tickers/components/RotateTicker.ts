import { Container as PixiContainer, UPDATE_PRIORITY } from "pixi.js";
import { RotateTickerProps, TickerBase, TickerValue } from "..";
import { canvas } from "../..";
import { logger } from "../../../utils/log-utility";
import RegisteredTickers from "../decorators/RegisteredTickers";
import { checkIfTextureNotIsEmpty } from "../functions/ticker-texture-utility";
import { updateTickerProgression } from "../functions/ticker-utility";

const DEFAULT_SPEED = 1;

/**
 * A ticker that rotates the canvas element of the canvas. For centre rotation, set the anchor of the canvas element to 0.5.
 * This ticker can be used on all canvas elements that extend the {@link PixiContainer} class.
 * @deprecated Use {@link canvas.animate}
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
    fn(ticker: TickerValue, args: RotateTickerProps, aliases: string[], _tickerId: string): void {
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
                            this.complete();
                        } else if (!clockwise && element.angle <= limit) {
                            element.angle = limit;
                            this.complete();
                        }
                    }
                    if (
                        speed < 0.00001 &&
                        !(speedProgression && speedProgression.type == "linear" && speedProgression.amt != 0)
                    ) {
                        logger.warn("The speed of the RotateTicker must be greater than 0.");
                        this.complete();
                        return;
                    }
                }
            });
        if (speedProgression) updateTickerProgression(args, "speed", speedProgression);
    }
    onComplete(alias: string | string[], _tickerId: string, args: RotateTickerProps): void {
        const { limit } = args;
        if (typeof alias === "string") {
            alias = [alias];
        }
        alias.forEach((alias) => {
            let element = canvas.find(alias);
            if (element) {
                if (limit !== undefined) {
                    element.angle = limit;
                }
            }
        });
    }
    private speedConvert(speed: number): number {
        return speed / 100;
    }

    override complete(options?: { ignoreTickerSteps?: boolean }): void {
        const { ignoreTickerSteps } = options || {};
        const id = this.tickerId;
        if (!id) {
            logger.warn("TickerBase.complete() called without tickerId set. This may cause issues.");
            return;
        }
        this.onComplete(this.canvasElementAliases, id, this.args);
        let aliasToRemoveAfter: string | string[] =
            ("aliasToRemoveAfter" in this.args && (this.args.aliasToRemoveAfter as any)) || [];
        if (typeof aliasToRemoveAfter === "string") {
            aliasToRemoveAfter = [aliasToRemoveAfter];
        }
        let tickerAliasToResume: string | string[] =
            ("tickerAliasToResume" in this.args && (this.args.tickerAliasToResume as any)) || [];
        if (typeof tickerAliasToResume === "string") {
            tickerAliasToResume = [tickerAliasToResume];
        }
        let tickerIdToResume: string | string[] =
            ("tickerIdToResume" in this.args && (this.args.tickerIdToResume as any)) || [];
        if (typeof tickerIdToResume === "string") {
            tickerIdToResume = [tickerIdToResume];
        }
        canvas.onTickerComplete(id, {
            aliasToRemoveAfter: aliasToRemoveAfter,
            tickerAliasToResume: tickerAliasToResume,
            tickerIdToResume: tickerIdToResume,
            ignoreTickerSteps: ignoreTickerSteps,
        });
        super.complete(options);
    }
}
RegisteredTickers.add(RotateTicker);
