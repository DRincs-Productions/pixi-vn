import { Texture } from "pixi.js";
import { videoFormats } from "../../constants";
import { ITextureMemory } from "../../interface/canvas";
import { GameWindowManager } from "../../managers";

/**
 * Get the memory object of the PixiJS texture
 * @param texture PixiJS Texture object
 * @returns Memory object of the texture
 */
export function getTextureMemory(texture: Texture): ITextureMemory {
    let sourceTexture = texture.source
    let textureMemory: ITextureMemory = {
        image: sourceTexture.label
    }
    return textureMemory
}

/**
 * Remove a element from the canvas.
 * @param tag is the unique tag of the element. You can use this tag to refer to this image
 */
export function removeCanvasElement(tag: string | string[]) {
    GameWindowManager.removeCanvasElement(tag)
}

export function checkIfVideo(imageUrl: string): boolean {
    if (imageUrl.match(new RegExp(`(${videoFormats.join('|')})$`))) {
        return true
    } else {
        return false
    }
}
