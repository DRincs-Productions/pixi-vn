import { Container as PixiContainer, Sprite as PixiSprite } from "@drincs/pixi-vn/pixi.js";
import { canvas } from "../..";
import { createExportableElement } from "../../../utils";
import { logger } from "../../../utils/log-utility";
import ImageContainer from "../../components/ImageContainer";
import ImageSprite from "../../components/ImageSprite";
import {
    calculatePositionByAlign,
    calculatePositionByPercentagePosition,
    getSuperHeight,
    getSuperPoint,
    getSuperWidth,
} from "../../functions/canvas-property-utility";
import TickerBase from "../classes/TickerBase";
import TickerValue from "../classes/TickerValue";
import RegisteredTickers from "../decorators/RegisteredTickers";
import { checkIfTextureNotIsEmpty } from "../functions/ticker-texture-utility";
import { updateTickerProgression } from "../functions/ticker-utility";
import { MoveTickerProps } from "../types/MoveTickerProps";

const DEFAULT_SPEED = 10;

function calculateDestination<T extends PixiContainer>(args: MoveTickerProps, element: T) {
    let destination = createExportableElement(args.destination);
    if (destination.type === "align") {
        let anchorx = undefined;
        let anchory = undefined;
        if (element instanceof PixiSprite) {
            anchorx = element.anchor.x;
            anchory = element.anchor.y;
        }
        let superPivot = getSuperPoint(element.pivot, element.angle);
        let superScale = getSuperPoint(element.scale, element.angle);
        destination.x = calculatePositionByAlign(
            "width",
            destination.x,
            getSuperWidth(element),
            superPivot.x,
            superScale.x < 0,
            anchorx
        );
        destination.y = calculatePositionByAlign(
            "height",
            destination.y,
            getSuperHeight(element),
            superPivot.y,
            superScale.y < 0,
            anchory
        );
    }
    if (destination.type === "percentage") {
        destination.x = calculatePositionByPercentagePosition("width", destination.x);
        destination.y = calculatePositionByPercentagePosition("height", destination.y);
    }
    return destination;
}

/**
 * A ticker that moves the canvas element of the canvas.
 * This ticker can be used on all canvas elements that extend the {@link PixiContainer} class.
 * @deprecated Use {@link canvas.animate}
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
export default class MoveTicker extends TickerBase<MoveTickerProps> {
    fn(ticker: TickerValue, args: MoveTickerProps, aliases: string[], _tickerId: string): void {
        if (args.speed === undefined) {
            args.speed = DEFAULT_SPEED;
        }

        const { speed, startOnlyIfHaveTexture, speedProgression } = args;

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
                    let destination = calculateDestination(args, element);
                    let xDistance = destination.x - element.x;
                    let yDistance = destination.y - element.y;
                    let xStep: 1 | -1 = xDistance > 0 ? 1 : -1;
                    let yStep: 1 | -1 = yDistance > 0 ? 1 : -1;

                    let xSpeed;
                    let ySpeed;
                    if (typeof speed === "number") {
                        let s = this.speedConvert(speed);
                        if (xDistance === 0 || yDistance === 0) {
                            xSpeed = ySpeed = s;
                        } else {
                            xSpeed = Math.abs(xDistance / (xDistance + yDistance)) * s;
                            ySpeed = Math.abs(yDistance / (xDistance + yDistance)) * s;
                        }
                    } else {
                        xSpeed = this.speedConvert(speed.x);
                        ySpeed = this.speedConvert(speed.y);
                    }

                    if (xSpeed > 0) {
                        element.x += xStep * xSpeed * ticker.deltaTime;
                        let newDistance = destination.x - element.x;
                        if ((xStep < 0 && newDistance > 0) || (xStep > 0 && newDistance < 0)) {
                            element.x = destination.x;
                        }
                    }
                    if (ySpeed > 0) {
                        element.y += yStep * ySpeed * ticker.deltaTime;
                        let newDistance = destination.y - element.y;
                        if ((yStep < 0 && newDistance > 0) || (yStep > 0 && newDistance < 0)) {
                            element.y = destination.y;
                        }
                    }
                    if (element.x == destination.x && element.y == destination.y) {
                        this.complete();
                        return;
                    } else if (
                        xSpeed < 0.00001 &&
                        ySpeed < 0.00001 &&
                        !(speedProgression && speedProgression.type == "linear" && speedProgression.amt != 0)
                    ) {
                        logger.warn("The speed of the MoveTicker must be greater than 0.");
                        this.complete();
                        return;
                    }
                }
            });
        if (speedProgression) updateTickerProgression(args, "speed", speedProgression);
    }
    onComplete(alias: string | string[], _tickerId: string, args: MoveTickerProps): void {
        if (typeof alias === "string") {
            alias = [alias];
        }
        alias.forEach((alias) => {
            let element = canvas.find(alias);
            if (element) {
                let destination = args.destination;
                if (element instanceof ImageSprite || element instanceof ImageContainer) {
                    element.positionInfo = destination;
                } else {
                    element.x = destination.x;
                    element.y = destination.y;
                }
            }
        });
    }
    private speedConvert(speed: number): number {
        return speed * (66 / 400);
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
RegisteredTickers.add(MoveTicker);
