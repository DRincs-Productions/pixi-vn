import { Container as PixiContainer, UPDATE_PRIORITY } from "pixi.js";
import { canvas, TickerValue } from "../..";
import { logger } from "../../../utils/log-utility";
import TickerBase from "../classes/TickerBase";
import RegisteredTickers from "../decorators/RegisteredTickers";
import { checkIfTextureNotIsEmpty } from "../functions/ticker-texture-utility";
import { updateTickerProgression } from "../functions/ticker-utility";
import { FadeAlphaTickerProps } from "../types/FadeAlphaTickerProps";

const DEFAULT_SPEED = 5;

/**
 * A ticker that fades the alpha of the canvas element of the canvas.
 * This ticker can be used on all canvas elements that extend the {@link PixiContainer} class.
 * @deprecated Use {@link canvas.animate}
 * @example
 * ```typescript
 * let bunny = addImage("bunny1", "https://pixijs.com/assets/eggHead.png")
 * await bunny.load()
 * canvas.add("bunny", bunny);
 * // ...
 * const ticker = new FadeAlphaTicker({
 *     duration: 4, // 4 seconds
 *     type: "hide",
 * }),
 * canvas.addTicker("bunny", ticker)
 * ```
 */
export default class FadeAlphaTicker extends TickerBase<FadeAlphaTickerProps> {
    constructor(args: FadeAlphaTickerProps = {}, duration?: number, priority?: UPDATE_PRIORITY) {
        super(args, duration, priority);
    }
    fn(ticker: TickerValue, args: FadeAlphaTickerProps, aliases: string[], _tickerId: string): void {
        if (args.speed === undefined) {
            if (args.duration === undefined) {
                args.speed = DEFAULT_SPEED;
            } else {
                args.speed = 600 / (args.duration * 60);
            }
        }

        const { type = "hide", startOnlyIfHaveTexture, speedProgression } = args;
        const speed = this.speedConvert(args.speed);

        let limit = this.getLimit(args);

        if (type === "hide" && limit < 0) {
            limit = 0;
        }
        if (type === "show" && limit > 1) {
            limit = 1;
        }
        aliases
            .filter((alias) => {
                let element = canvas.find(alias);
                if (!element) {
                    return false;
                }
                if (startOnlyIfHaveTexture) {
                    if (!checkIfTextureNotIsEmpty(element)) {
                        return false;
                    }
                }
                return true;
            })
            .forEach((alias) => {
                let element = canvas.find(alias);
                if (element && element instanceof PixiContainer) {
                    if (type === "show" && element.alpha < limit) {
                        element.alpha += speed * ticker.deltaTime;
                    } else if (type === "hide" && element.alpha > limit) {
                        element.alpha -= speed * ticker.deltaTime;
                    }
                    if (type === "show" && element.alpha >= limit) {
                        this.complete();
                        return;
                    } else if (type === "hide" && element.alpha <= limit) {
                        this.complete();
                        return;
                    }
                    if (
                        speed < 0.00001 &&
                        !(speedProgression && speedProgression.type == "linear" && speedProgression.amt != 0)
                    ) {
                        logger.warn("The speed of the FadeAlphaTicker must be greater than 0.");
                        this.complete();
                        return;
                    }
                }
            });
        if (speedProgression) updateTickerProgression(args, "speed", speedProgression);
    }
    onComplete(alias: string | string[], _tickerId: string, args: FadeAlphaTickerProps): void {
        if (typeof alias === "string") {
            alias = [alias];
        }
        alias.forEach((alias) => {
            let element = canvas.find(alias);
            if (element) {
                let limit = this.getLimit(args);
                element.alpha = limit;
            }
        });
    }
    private getLimit(args: FadeAlphaTickerProps): number {
        const { type = "hide", limit = type === "hide" ? 0 : 1 } = args;
        return limit;
    }
    private speedConvert(speed: number): number {
        return speed / 600;
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
RegisteredTickers.add(FadeAlphaTicker);
