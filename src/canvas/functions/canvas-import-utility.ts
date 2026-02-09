import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import CanvasBaseItem from "../classes/CanvasBaseItem";
import { assetsData } from "../components/AsyncLoadExtension";
import { default as RegisteredCanvasComponents } from "../decorators/canvas-element-decorator";
import AssetMemory from "../interfaces/AssetMemory";
import CanvasBaseItemMemory from "../interfaces/memory/CanvasBaseItemMemory";

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
    if (!element) {
        throw new Error("[Pixi’VN] The element " + memory.pixivnId + " could not be created");
    }

    return element;
}
