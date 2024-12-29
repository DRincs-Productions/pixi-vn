import { Container as PixiContainer } from "pixi.js";
import { CanvasBaseItemMemory } from "../../interface";

export default class CanvasBaseItem<T2 extends CanvasBaseItemMemory> extends PixiContainer {
    get memory(): T2 { throw new Error("[Pixi’VN] The method CanvasBaseItem.memory must be overridden") }
    set memory(_value: T2) { throw new Error("[Pixi’VN] The method CanvasBaseItems.memory must be overridden") }
    setMemory(_value: T2): Promise<void> | void { throw new Error("[Pixi’VN] The method CanvasBaseItems.memory must be overridden") }
    pixivnId: string = "canvas_element_id_not_set"
}
