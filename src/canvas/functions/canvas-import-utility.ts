import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { logger } from "../../utils/log-utility";
import CanvasBaseItem from "../classes/CanvasBaseItem";
import { assetsData } from "../components/AsyncLoadExtension";
import { default as RegisteredCanvasComponents } from "../decorators/canvas-element-decorator";
import AssetMemory from "../interfaces/AssetMemory";
import { CanvasBaseInterface } from "../interfaces/CanvasBaseInterface";
import CanvasBaseItemMemory from "../interfaces/memory/CanvasBaseItemMemory";
import { CanvasElementAliasType } from "../types/CanvasElementAliasType";

/**
 * Import a Canvas element from a memory object
 * @param memory Memory object of the canvas
 * @returns Canvas element
 */
export async function importCanvasElement<M extends CanvasBaseItemMemory, T extends CanvasBaseItem<M>>(
    memory: M,
): Promise<T> {
    if (assetsData in memory && Array.isArray((memory as any)[assetsData])) {
        const promises = (memory as { assetsData: AssetMemory[] })[assetsData].map(
            (asset) => asset.alias && PIXI.Assets.load(asset.alias),
        );
        await Promise.all(promises);
    }
    let element = await RegisteredCanvasComponents.getInstance<M, T>(memory.pixivnId, memory);
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
