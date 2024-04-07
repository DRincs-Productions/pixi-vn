import { CanvasContainer, CanvasImage, CanvasSprite, CanvasText } from "../classes/canvas"
import CanvasBase from "../classes/canvas/CanvasBase"
import { CanvasElementTagType } from "../types/CanvasElementTagType"

export const registeredCanvasElement: { [name: CanvasElementTagType]: typeof CanvasBase<any> } = {}
/**
 * Is a decorator that register a canvas element in the game.
 * @param name Name of the canvas element, by default it will use the class name. If the name is already registered, it will show a warning
 * @returns 
 */
export default function canvasElementDecorator(name?: CanvasElementTagType) {
    return function (target: typeof CanvasBase<any>) {
        if (!name) {
            name = target.name
        }
        if (registeredCanvasElement[name]) {
            console.warn(`[Pixi'VN] CanvasElement ${name} already registered`)
        }
        registeredCanvasElement[name] = target
    }
}

export function getCanvasElementTypeByClassName<T extends typeof CanvasBase<any>>(canvasName: CanvasElementTagType): T | undefined {
    try {
        let eventType = registeredCanvasElement[canvasName]
        if (!eventType) {
            console.error(`[Pixi'VN] CanvasElement ${canvasName} not found`)
            return
        }
        new eventType()
        return eventType as T
    }
    catch (e) {
        console.error(`[Pixi'VN] Error while getting CanvasElement ${canvasName}`, e)
        return
    }
}

export function getCanvasElementInstanceByClassName<T extends CanvasBase<any>>(canvasName: CanvasElementTagType): T | undefined {
    try {
        let eventType = registeredCanvasElement[canvasName]
        if (!eventType) {
            if (canvasName === "CanvasContainer") {
                eventType = CanvasContainer
            }
            else if (canvasName === "CanvasImage") {
                eventType = CanvasImage
            }
            else if (canvasName === "CanvasSprite") {
                eventType = CanvasSprite
            }
            else if (canvasName === "CanvasText") {
                eventType = CanvasText
            }
        }

        if (!eventType) {
            console.error(`[Pixi'VN] CanvasElement ${canvasName} not found`)
            return
        }
        let canvasElement = new eventType()
        return canvasElement as T
    }
    catch (e) {
        console.error(`[Pixi'VN] Error while getting CanvasElement ${canvasName}`, e)
        return
    }
}
