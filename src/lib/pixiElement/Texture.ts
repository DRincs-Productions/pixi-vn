import { Texture } from "pixi.js";

export interface ITextureMemory {
    image: string,
}

export function getTextureMemory(texture: Texture): ITextureMemory {
    let baseTexture = texture.baseTexture
    let textureMemory: ITextureMemory = {
        image: (baseTexture.resource as any).url
    }
    return textureMemory
}
