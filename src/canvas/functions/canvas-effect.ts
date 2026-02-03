import type { UPDATE_PRIORITY } from "@drincs/pixi-vn/pixi.js";
import { canvas, ShakeEffectProps } from "..";
import { logger } from "../../utils/log-utility";

/**
 * Shake the canvas element.
 * If there is a/more ticker(s) with the same alias, then the ticker(s) is/are paused.
 * @param alias
 * @param options
 * @param priority
 * @returns
 */
export async function shakeEffect(
    alias: string,
    options: ShakeEffectProps = {},
    priority?: UPDATE_PRIORITY,
): Promise<string[] | undefined> {
    let elemet = canvas.find(alias);
    if (!elemet) {
        logger.error(`The element with the alias ${alias} does not exist. So the shake effect can't be applied.`);
        return;
    }
    let position = { x: elemet.position.x, y: elemet.position.y };
    const { shakeType = "horizontal", maxShockSize = 10, shocksNumber: shocksNumberTemp = 10, ...rest } = options;
    let shocksNumber = shocksNumberTemp - 1;
    if (shocksNumber < 2) {
        logger.error("The number of shocks must be at least 3.");
        return;
    }
    let upshocksNumber = Math.floor(shocksNumber / 2);
    let downshocksNumber = Math.ceil(shocksNumber / 2);

    let array: number[] = [];
    for (let i = 0; i < upshocksNumber; i++) {
        let shockSize = (maxShockSize * (i + 1)) / upshocksNumber;
        if (shakeType === "horizontal") {
            if (i % 2 !== 0) {
                array.push(position.x + shockSize);
            } else {
                array.push(position.x - shockSize);
            }
        } else {
            if (i % 2 !== 0) {
                array.push(position.y + shockSize);
            } else {
                array.push(position.y - shockSize);
            }
        }
    }
    let lastItemIsLeft = upshocksNumber % 2 === 0;
    for (let i = downshocksNumber; i > 0; i--) {
        let shockSize = (maxShockSize * (i + 1)) / (downshocksNumber - 1);
        if (shakeType === "horizontal") {
            if ((i % 2 === 0 && !lastItemIsLeft) || (i % 2 !== 0 && lastItemIsLeft)) {
                array.push(position.x - shockSize);
            } else {
                array.push(position.x + shockSize);
            }
        } else {
            if ((i % 2 === 0 && !lastItemIsLeft) || (i % 2 !== 0 && lastItemIsLeft)) {
                array.push(position.y - shockSize);
            } else {
                array.push(position.y + shockSize);
            }
        }
    }

    let id: string | undefined;
    if (shakeType === "horizontal") {
        array.push(position.x);
        id = canvas.animate(alias, { x: array }, rest, priority);
    } else {
        array.push(position.y);
        id = canvas.animate(alias, { y: array }, rest, priority);
    }
    if (id) {
        return [id];
    }
}
