import { CanvasContainer, CanvasImage, CanvasSprite, CanvasText } from "../classes/canvas"
import CanvasBase from "../classes/canvas/CanvasBase"
import { CANVAS_CONTAINER_ID } from "../classes/canvas/CanvasContainer"
import { CANVAS_IMAGE_ID } from "../classes/canvas/CanvasImage"
import { CANVAS_SPRITE_ID } from "../classes/canvas/CanvasSprite"
import { CANVAS_TEXT_ID } from "../classes/canvas/CanvasText"
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
        target.prototype.pixivnId = name
        registeredCanvasElement[name] = target
    }
}

export function getCanvasElementTypeById<T extends typeof CanvasBase<any>>(canvasId: CanvasElementTagType): T | undefined {
    try {
        let eventType = registeredCanvasElement[canvasId]
        if (!eventType) {
            console.error(`[Pixi'VN] CanvasElement ${canvasId} not found`)
            return
        }
        new eventType()
        return eventType as T
    }
    catch (e) {
        console.error(`[Pixi'VN] Error while getting CanvasElement ${canvasId}`, e)
        return
    }
}

export function getCanvasElementInstanceById<T extends CanvasBase<any>>(canvasId: CanvasElementTagType): T | undefined {
    try {
        let eventType = registeredCanvasElement[canvasId]
        if (!eventType) {
            if (canvasId === CANVAS_CONTAINER_ID) {
                eventType = CanvasContainer
            }
            else if (canvasId === CANVAS_IMAGE_ID) {
                eventType = CanvasImage
            }
            else if (canvasId === CANVAS_SPRITE_ID) {
                eventType = CanvasSprite
            }
            else if (canvasId === CANVAS_TEXT_ID) {
                eventType = CanvasText
            }
        }

        if (!eventType) {
            console.error(`[Pixi'VN] CanvasElement ${canvasId} not found`)
            return
        }
        let canvasElement = new eventType()
        return canvasElement as T
    }
    catch (e) {
        console.error(`[Pixi'VN] Error while getting CanvasElement ${canvasId}`, e)
        return
    }
}
