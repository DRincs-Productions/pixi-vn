import { DisplayObject } from "pixi.js";
import { CanvasContainerBase } from "../classes/canvas/CanvasContainer";
import { CanvasBase } from "../classes/canvas/DisplayObjectStored";
import { ICanvasBaseMemory } from "../interface/canvas/ICanvasBaseMemory";

export function exampleFunction<T1 extends DisplayObject, T2 extends ICanvasBaseMemory>(
    element: CanvasBase<T1, T2>,
): T2 {
    let temp = element.memory
    if (!element.hasOwnProperty("listChildren")) {
        return temp
    }
    (element as CanvasContainerBase<any, any>).listChildren.forEach(child => {
        temp.elements.push(exampleFunction(child))
    })
    return temp
}