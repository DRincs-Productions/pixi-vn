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
            console.warn(`CanvasElement ${name} already registered`)
        }
        registeredCanvasElement[name] = target
    }
}

export function getCanvasElementTypeByClassName<T extends typeof CanvasBase<any>>(canvasName: CanvasElementTagType): T | undefined {
    try {
        let eventType = registeredCanvasElement[canvasName]
        if (!eventType) {
            console.error(`CanvasElement ${canvasName} not found`)
            return
        }
        new eventType()
        return eventType as T
    }
    catch (e) {
        console.error(e)
        return
    }
}

export function getCanvasElementInstanceByClassName<T extends CanvasBase<any>>(canvasName: CanvasElementTagType): T | undefined {
    try {
        let eventType = registeredCanvasElement[canvasName]
        if (!eventType) {
            console.error(`CanvasElement ${canvasName} not found`)
            return
        }
        let canvasElement = new eventType()
        return canvasElement as T
    }
    catch (e) {
        console.error(e)
        return
    }
}
