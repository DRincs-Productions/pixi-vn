import { Texture } from "pixi.js";
import { ITextureMemory } from "../interface/canvas/ITextureMemory";

export function getTextureMemory(texture: Texture): ITextureMemory {
    let baseTexture = texture.baseTexture
    let textureMemory: ITextureMemory = {
        image: (baseTexture.resource as any).url
    }
    return textureMemory
}

export function getTexture(textureMemory: ITextureMemory) {
    let texture = Texture.from(textureMemory.image)
    return texture
}
