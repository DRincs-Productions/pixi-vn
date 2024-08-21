import { Texture } from "pixi.js";
import { videoFormats } from "../../constants";
import { ITextureMemory } from "../../interface/canvas";
import { canvas } from "../../managers";

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
 * @deprecated use canvas.remove
 */
export function removeCanvasElement(alias: string | string[]) {
    canvas.remove(alias)
}

export function checkIfVideo(imageUrl: string): boolean {
    if (imageUrl.match(new RegExp(`(${videoFormats.join('|')})$`))) {
        return true
    } else {
        return false
    }
}
