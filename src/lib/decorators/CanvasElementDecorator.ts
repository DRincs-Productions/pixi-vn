import { ICanvasBase } from "../interface/ICanvasBase"
import { CanvasElementTagType } from "../types/CanvasElementTagType"

export const registeredCanvasElement: { [name: CanvasElementTagType]: typeof ICanvasBase<any> } = {}
export function canvasElementDecorator(name?: CanvasElementTagType) {
    return function (target: typeof ICanvasBase<any>) {
        if (!name) {
            name = target.name
        }
        if (registeredCanvasElement[name]) {
            console.warn(`CanvasElement ${name} already registered`)
        }
        registeredCanvasElement[name] = target
    }
}

export function getEventTypeByClassName<T extends typeof ICanvasBase<any>>(canvasName: CanvasElementTagType): T | undefined {
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

export function getEventInstanceByClassName<T extends ICanvasBase<any>>(canvasName: CanvasElementTagType): T | undefined {
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
