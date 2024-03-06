import { Container } from "pixi.js";
import { getMemoryContainer } from "../../functions/CanvasUtility";
import { ICanvasContainerMemory } from "../../interface/canvas/ICanvasContainerMemory";
import { CanvasBase } from "./CanvasBase";

/**
 * This class is responsible for storing a PIXI Container.
 * And allow to save your memory in a game save.
 */
export class CanvasContainer extends Container implements CanvasBase<ICanvasContainerMemory> {
    get memory(): ICanvasContainerMemory {
        return getMemoryContainer(this)
    }
}
