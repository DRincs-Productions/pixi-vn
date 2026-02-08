import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { AssetMemory } from "dist";
import { logger } from "../../utils/log-utility";
import { assetsData } from "../components/AsyncLoadExtension";
import { default as RegisteredCanvasComponents } from "../decorators/canvas-element-decorator";
import { CanvasBaseInterface } from "../interfaces/CanvasBaseInterface";
import CanvasBaseItemMemory from "../interfaces/memory/CanvasBaseItemMemory";
import { CanvasElementAliasType } from "../types/CanvasElementAliasType";

/**
 * Import a Canvas element from a memory object
 * @param memory Memory object of the canvas
 * @returns Canvas element
 */
export async function importCanvasElement<T extends CanvasBaseInterface<CanvasBaseItemMemory>>(
    memory: CanvasBaseItemMemory,
): Promise<T> {
    if (assetsData in memory && Array.isArray((memory as any)[assetsData])) {
        const promises = (memory as { assetsData: AssetMemory[] })[assetsData].map(
            (asset) => asset.alias && PIXI.Assets.load(asset.alias),
        );
        await Promise.all(promises);
    }
    let element = getCanvasElementInstanceById<T>(memory.pixivnId, memory);
    if (element) {
        await element.setMemory(memory);
    } else {
        throw new Error("[Pixi’VN] The element " + memory.pixivnId + " could not be created");
    }

    return element;
}

export function getCanvasElementInstanceById<T extends CanvasBaseInterface<any>>(
    canvasId: CanvasElementAliasType,
    memory: CanvasBaseItemMemory,
): T | undefined {
    try {
        let eventType = RegisteredCanvasComponents.get(canvasId);
        if (!eventType) {
            return;
        }
        let canvasElement = new eventType(memory);
        return canvasElement as T;
    } catch (e) {
        logger.error(`Error while getting CanvasElement ${canvasId}`, e);
        return;
    }
}
