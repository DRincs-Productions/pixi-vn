import { Container, ImageContainer, ImageSprite, Sprite, Text, VideoSprite } from "../classes"
import CanvasBaseItem from "../classes/canvas/CanvasBaseItem"
import { CANVAS_CONTAINER_ID, CANVAS_IMAGE_CONTAINER_ID, CANVAS_IMAGE_ID, CANVAS_SPRITE_ID, CANVAS_TEXT_ID, CANVAS_VIDEO_ID } from "../constants"
import { CanvasElementAliasType } from "../types/CanvasElementAliasType"

export const registeredCanvasElement: { [name: CanvasElementAliasType]: typeof CanvasBaseItem<any> } = {}
/**
 * Is a decorator that register a canvas element in the game.
 * @param name Name of the canvas element, by default it will use the class name. If the name is already registered, it will show a warning
 * @returns 
 */
export default function canvasElementDecorator(name?: CanvasElementAliasType) {
    return function (target: typeof CanvasBaseItem<any>) {
        if (!name) {
            name = target.name
        }
        if (registeredCanvasElement[name]) {
            console.warn(`[Pixi’VN] CanvasElement ${name} already registered`)
        }
        target.prototype.pixivnId = name
        registeredCanvasElement[name] = target
    }
}

export function getCanvasElementTypeById<T extends typeof CanvasBaseItem<any>>(canvasId: CanvasElementAliasType): T | undefined {
    try {
        let eventType = registeredCanvasElement[canvasId]
        if (!eventType) {
            console.error(`[Pixi’VN] CanvasElement ${canvasId} not found`)
            return
        }
        new eventType()
        return eventType as T
    }
    catch (e) {
        console.error(`[Pixi’VN] Error while getting CanvasElement ${canvasId}`, e)
        return
    }
}

export function getCanvasElementInstanceById<T extends CanvasBaseItem<any>>(canvasId: CanvasElementAliasType): T | undefined {
    try {
        let eventType = registeredCanvasElement[canvasId]
        if (!eventType) {
            if (canvasId === CANVAS_CONTAINER_ID) {
                eventType = Container
            }
            else if (canvasId === CANVAS_VIDEO_ID) {
                eventType = VideoSprite
            }
            else if (canvasId === CANVAS_IMAGE_ID) {
                eventType = ImageSprite
            }
            else if (canvasId === CANVAS_SPRITE_ID) {
                eventType = Sprite
            }
            else if (canvasId === CANVAS_TEXT_ID) {
                eventType = Text
            }
            else if (canvasId === CANVAS_IMAGE_CONTAINER_ID) {
                eventType = ImageContainer
            }
        }

        if (!eventType) {
            console.error(`[Pixi’VN] CanvasElement ${canvasId} not found`)
            return
        }
        let canvasElement = new eventType()
        return canvasElement as T
    }
    catch (e) {
        console.error(`[Pixi’VN] Error while getting CanvasElement ${canvasId}`, e)
        return
    }
}
