import { Assets, ContainerOptions, Container as PixiContainer, PointData } from "pixi.js";
import { CanvasBaseItem, ImageContainer, ImageSprite, Sprite, Text, VideoSprite } from "../../classes";
import { getCanvasElementInstanceById } from "../../decorators/canvas-element-decorator";
import { getEventTypeById } from "../../decorators/event-decorator";
import { CanvasBaseItemMemory, ImageSpriteMemory, SpriteBaseMemory, TextMemory, VideoSpriteMemory } from "../../interface";
import { CanvasEventNamesType } from "../../types";
import { getTexture } from "../texture-utility";

/**
 * Export a Canvas element to a memory object
 * @param element Canvas element
 * @returns Memory object of the canvas
 */
export function exportCanvasElement<T extends CanvasBaseItem<any>>(
    element: T,
): CanvasBaseItemMemory {
    return element.memory
}

/**
 * Import a Canvas element from a memory object
 * @param memory Memory object of the canvas
 * @returns Canvas element
 */
export async function importCanvasElement<T extends CanvasBaseItem<any>>(
    memory: CanvasBaseItemMemory,
): Promise<T> {
    let element = getCanvasElementInstanceById<T>(memory.pixivnId)
    if (element) {
        await element.setMemory(memory)
    }
    else {
        throw new Error("[Pixi’VN] The element " + memory.pixivnId + " could not be created")
    }

    return element
}

export function setMemoryContainer<T extends PixiContainer>(element: T | PixiContainer, memory: ContainerOptions | {}, opstions?: {
    ignoreScale?: boolean,
}) {
    let ignoreScale = opstions?.ignoreScale || false
    "isRenderGroup" in memory && memory.isRenderGroup !== undefined && (element.isRenderGroup = memory.isRenderGroup)
    "blendMode" in memory && memory.blendMode !== undefined && (element.blendMode = memory.blendMode)
    "tint" in memory && memory.tint !== undefined && (element.tint = memory.tint)
    "alpha" in memory && memory.alpha !== undefined && (element.alpha = memory.alpha)
    "angle" in memory && memory.angle !== undefined && (element.angle = memory.angle)
    "renderable" in memory && memory.renderable !== undefined && (element.renderable = memory.renderable)
    "rotation" in memory && memory.rotation !== undefined && (element.rotation = memory.rotation)
    if (!ignoreScale && "scale" in memory && memory.scale !== undefined) {
        if (typeof memory.scale === "number") {
            element.scale.set(memory.scale, memory.scale)
        }
        else {
            element.scale.set(memory.scale.x, memory.scale.y)
        }
    }
    if ("pivot" in memory && memory.pivot !== undefined) {
        if (typeof memory.pivot === "number") {
            element.pivot.set(memory.pivot, memory.pivot)
        }
        else {
            element.pivot.set(memory.pivot.x, memory.pivot.y)
        }
    }
    "position" in memory && memory.position !== undefined && (element.position.set(memory.position.x, memory.position.y))
    "skew" in memory && memory.skew !== undefined && (element.skew.set(memory.skew.x, memory.skew.y))
    "visible" in memory && memory.visible !== undefined && (element.visible = memory.visible)
    "x" in memory && memory.x !== undefined && (element.x = memory.x)
    "y" in memory && memory.y !== undefined && (element.y = memory.y)
    "boundsArea" in memory && memory.boundsArea !== undefined && (element.boundsArea = memory.boundsArea)

    "cursor" in memory && memory.cursor !== undefined && (element.cursor = memory.cursor)
    "eventMode" in memory && memory.eventMode !== undefined && (element.eventMode = memory.eventMode)
    "interactive" in memory && memory.interactive !== undefined && (element.interactive = memory.interactive)
    "interactiveChildren" in memory && memory.interactiveChildren !== undefined && (element.interactiveChildren = memory.interactiveChildren)
    "hitArea" in memory && memory.hitArea !== undefined && (element.hitArea = memory.hitArea)

    // end
    if (element instanceof ImageContainer) {
        "anchor" in memory && memory.anchor !== undefined && (element.anchor = memory.anchor as number | PointData)
        "align" in memory && memory.align !== undefined && (element.align = memory.align as Partial<PointData>)
        "loadIsStarted" in memory && memory.loadIsStarted && (element.load())
    }
    // width and height must be set after the scale
    if (!ignoreScale) {
        "width" in memory && memory.width !== undefined && (element.width = memory.width)
        "height" in memory && memory.height !== undefined && (element.height = memory.height)
    }
}

export async function setMemorySprite<Memory extends SpriteBaseMemory>(element: Sprite<any>, memory: Memory | {}) {
    setMemoryContainer(element, memory)
    if ("textureImage" in memory && memory.textureImage && memory.textureImage.image) {
        let texture = await getTexture(memory.textureImage.image)
        if (texture) {
            element.texture = texture
        }
    }
    if ("textureData" in memory) {
        if (memory.textureData.alias && Assets.resolver.hasKey(memory.textureData.alias)) {
            getTexture(memory.textureData.alias)
                .then((texture) => {
                    if (texture) {
                        element.texture = texture
                    }
                })
        }
        else {
            getTexture(memory.textureData.url)
                .then((texture) => {
                    if (texture) {
                        element.texture = texture
                    }
                })
        }
    }
    if (element instanceof ImageSprite) {
        "align" in memory && memory.align !== undefined && (element.align = (memory as ImageSpriteMemory).align!)
        "imageLink" in memory && memory.imageLink !== undefined && (element.textureAlias = (memory as ImageSpriteMemory).imageLink!)
        "loadIsStarted" in memory && memory.loadIsStarted && (element.load())
    }
    if ("anchor" in memory && memory.anchor !== undefined) {
        if (typeof memory.anchor === "number") {
            element.anchor.set(memory.anchor, memory.anchor)
        }
        else {
            element.anchor.set(memory.anchor.x, memory.anchor.y)
        }
    }
    "roundPixels" in memory && memory.roundPixels !== undefined && (element.roundPixels = memory.roundPixels)
    if ("onEvents" in memory) {
        for (let event in memory.onEvents) {
            let id = memory.onEvents[event]
            let instance = getEventTypeById(id)
            if (instance) {
                element.onEvent(event, instance)
            }
        }
    }
    if (element instanceof VideoSprite) {
        "loop" in memory && memory.loop !== undefined && (element.loop = (memory as VideoSpriteMemory).loop!)
        "currentTime" in memory && memory.currentTime !== undefined && (element.currentTime = (memory as VideoSpriteMemory).currentTime!)
        "paused" in memory && memory.paused !== undefined && (element.paused = (memory as VideoSpriteMemory).paused!)
    }
}

export function setMemoryText(element: Text, memory: TextMemory | {}) {
    setMemoryContainer(element, memory)
    if ("anchor" in memory && memory.anchor !== undefined) {
        if (typeof memory.anchor === "number") {
            element.anchor.set(memory.anchor, memory.anchor)
        }
        else {
            element.anchor.set(memory.anchor.x, memory.anchor.y)
        }
    }
    "text" in memory && memory.text !== undefined && (element.text = memory.text)
    "resolution" in memory && memory.resolution !== undefined && (element.resolution = memory.resolution)
    "style" in memory && memory.style !== undefined && (element.style = memory.style)
    "roundPixels" in memory && memory.roundPixels !== undefined && (element.roundPixels = memory.roundPixels)
    if ("onEvents" in memory) {
        for (let event in memory.onEvents) {
            let id = memory.onEvents[event]
            let instance = getEventTypeById(id)
            if (instance) {
                element.onEvent(event as CanvasEventNamesType, instance)
            }
        }
    }
}
