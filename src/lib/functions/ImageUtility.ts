import { Assets, Container, Sprite, Texture } from 'pixi.js';
import { Scene } from '../classes/Scene';
import { GameWindowManager } from '../managers/WindowManager';
import { STRING_ERRORS, showErrorText } from './ErrorUtility';

export function showImage(tag: string, imageUrl: string): Scene | undefined {
    const scene = new Scene()
    try {
        GameWindowManager.addChild(tag, scene)
    }
    catch (e) {
        console.error(e)
        return
    }

    let sprite = showImageIntoContainer(imageUrl, scene)
    if (!sprite) {
        return
    }
    scene.addChild(sprite)
    return scene
}

export function showImageIntoContainer<T extends Container>(imageUrl: string, container: T): Sprite | undefined {
    let texture: Texture | undefined = undefined
    try {
        texture = Texture.from(imageUrl)
    }
    catch (e) {
        showErrorText(STRING_ERRORS.IMAGE_NOT_FOUND, container)
        console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
        return
    }

    if (!texture) {
        showErrorText(STRING_ERRORS.IMAGE_NOT_FOUND, container)
        console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
        return
    }
    // if texture not is a Texture, then it is a TextureResource
    if (!(texture instanceof Texture)) {
        showErrorText(STRING_ERRORS.FILE_NOT_IS_IMAGE, container)
        console.error(STRING_ERRORS.FILE_NOT_IS_IMAGE, imageUrl)
        return
    }

    let sprite = new Sprite(texture)
    container.addChild(sprite)
    return sprite
}

export async function showImageAsync(tag: string, imageUrl: string): Promise<void | Scene | undefined> {
    const scene = new Scene()
    try {
        GameWindowManager.addChild(tag, scene)
    }
    catch (e) {
        console.error(e)
        return
    }

    return await showImageIntoContainerAsync(imageUrl, scene)
        .then((sprite) => {
            if (!sprite) {
                return
            }
            scene.addChild(sprite)
            return scene
        })
        .catch(() => {
            return
        })
}

export async function showImageIntoContainerAsync<T extends Container>(imageUrl: string, container: T): Promise<void | Sprite | undefined> {
    return Assets.load(imageUrl)
        .then((texture) => {
            if (!texture) {
                showErrorText(STRING_ERRORS.IMAGE_NOT_FOUND, container)
                console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
                return
            }
            // if texture not is a Texture, then it is a TextureResource
            if (!(texture instanceof Texture)) {
                showErrorText(STRING_ERRORS.FILE_NOT_IS_IMAGE, container)
                console.error(STRING_ERRORS.FILE_NOT_IS_IMAGE, imageUrl)
                return
            }

            const sprite = new Sprite(texture)
            container.addChild(sprite)
            return sprite
        })
        .catch(() => {
            showErrorText(STRING_ERRORS.IMAGE_NOT_FOUND, container)
            console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
            return
        })
}

export function hideImage(tag: string) {
    GameWindowManager.removeChild(tag)
}
