import { Container as PixiContainer, UPDATE_PRIORITY } from "pixi.js";
import { TickerBase, tickerDecorator, TickerValue } from "..";
import { canvas } from "../..";
import { ZoomTickerProps } from "../../../types/ticker";
import { logger } from "../../../utils/log-utility";
import { checkIfTextureNotIsEmpty } from "../../functions/ticker-utility";
import { updateTickerProgression } from "../functions/ticker-utility";

const DEFAULT_SPEED = 10;

/**
 * A ticker that zooms the canvas element of the canvas.
 * This ticker can be used on all canvas elements that extend the {@link PixiContainer} class.
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
    constructor(args: ZoomTickerProps = {}, duration?: number, priority?: UPDATE_PRIORITY) {
        super(args, duration, priority);
    }
    override fn(ticker: TickerValue, args: ZoomTickerProps, alias: string[], tickerId: string): void {
        if (args.speed === undefined) {
            args.speed = DEFAULT_SPEED;
        }

        const { speed, type = "zoom", startOnlyIfHaveTexture, speedProgression } = args;

        let xSpeed;
        let ySpeed;
        if (typeof speed === "number") {
            xSpeed = this.speedConvert(speed);
            ySpeed = this.speedConvert(speed);
        } else {
            xSpeed = this.speedConvert(speed.x);
            ySpeed = this.speedConvert(speed.y);
        }
        let limit = this.getLimit(args);
        alias
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
                    if (type === "zoom" && (element.scale.x < limit.x || element.scale.y < limit.y)) {
                        element.scale.x += xSpeed * ticker.deltaTime;
                        element.scale.y += ySpeed * ticker.deltaTime;
                    } else if (type === "unzoom" && (element.scale.x > limit.x || element.scale.y > limit.y)) {
                        element.scale.x -= xSpeed * ticker.deltaTime;
                        element.scale.y -= ySpeed * ticker.deltaTime;
                    }
                    if (type === "zoom") {
                        if (element.scale.x > limit.x) {
                            element.scale.x = limit.x;
                        }
                        if (element.scale.y > limit.y) {
                            element.scale.y = limit.y;
                        }
                        if (element.scale.x >= limit.x && element.scale.y >= limit.y) {
                            this.onEndOfTicker(alias, tickerId, args);
                            return;
                        }
                    } else if (type === "unzoom") {
                        if (element.scale.x < limit.x) {
                            element.scale.x = limit.x;
                        }
                        if (element.scale.y < limit.y) {
                            element.scale.y = limit.y;
                        }
                        if (element.scale.x <= limit.x && element.scale.y <= limit.y) {
                            this.onEndOfTicker(alias, tickerId, args);
                            return;
                        }
                    }
                    if (
                        ((xSpeed < 0.00001 && ySpeed < 0.00001) ||
                            (xSpeed < 0.00001 && element.scale.y == limit.y) ||
                            (ySpeed < 0.00001 && element.scale.x == limit.x)) &&
                        !(speedProgression && speedProgression.type == "linear" && speedProgression.amt != 0)
                    ) {
                        logger.warn("The speed of the ZoomTicker must be greater than 0.");
                        this.onEndOfTicker(alias, tickerId, args, { editScale: false });
                        return;
                    }
                }
            });
        if (speedProgression) updateTickerProgression(args, "speed", speedProgression);
    }
    private speedConvert(speed: number): number {
        return speed / 600;
    }
    override onEndOfTicker(
        alias: string | string[],
        tickerId: string,
        args: ZoomTickerProps,
        options: { editScale?: boolean } = { editScale: true }
    ): void {
        const { isZoomInOut } = args;
        if (typeof alias === "string") {
            alias = [alias];
        }
        alias.forEach((alias) => {
            let element = canvas.find(alias);
            if (element) {
                if (options.editScale) {
                    let limit = this.getLimit(args);
                    element.scale.x = limit.x;
                    element.scale.y = limit.y;
                }
                if (isZoomInOut) {
                    let { pivot, position } = isZoomInOut;
                    element.pivot = pivot.x;
                    element.position = position;
                }
            }
        });
        super.onEndOfTicker(alias, tickerId, args);
    }
    private getLimit(args: ZoomTickerProps): { x: number; y: number } {
        const { type = "zoom", limit } = args;
        let xLimit = type === "zoom" ? Infinity : 0;
        let yLimit = type === "zoom" ? Infinity : 0;
        if (limit) {
            if (typeof limit === "number") {
                xLimit = limit;
                yLimit = limit;
            } else {
                xLimit = limit.x;
                yLimit = limit.y;
            }
        }
        return { x: xLimit, y: yLimit };
    }
}
