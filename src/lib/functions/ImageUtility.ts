import { Assets, Texture } from 'pixi.js';
import { GameWindowManager } from '../managers/WindowManager';
import { ContainerST } from '../pixiElement/ContainerST';
import { SpriteST } from '../pixiElement/SpriteST';
import { STRING_ERRORS, showErrorText } from './ErrorUtility';

export function showImage(tag: string, imageUrl: string): ContainerST | undefined {
    const container = new ContainerST()
    try {
        GameWindowManager.addChild(tag, container)
    }
    catch (e) {
        console.error(e)
        return
    }

    let sprite = showImageIntoContainer(imageUrl, container)
    if (!sprite) {
        return
    }
    container.addChild(sprite)
    return container
}

export function showImageIntoContainer<T extends ContainerST>(imageUrl: string, container: T): SpriteST | undefined {
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

    let sprite = new SpriteST(texture)
    container.addChild(sprite)
    return sprite
}

export async function showImageAsync(tag: string, imageUrl: string): Promise<void | ContainerST | undefined> {
    const container = new ContainerST()
    try {
        GameWindowManager.addChild(tag, container)
    }
    catch (e) {
        console.error(e)
        return
    }

    return await showImageIntoContainerAsync(imageUrl, container)
        .then((sprite) => {
            if (!sprite) {
                return
            }
            container.addChild(sprite)
            return container
        })
        .catch(() => {
            return
        })
}

export async function showImageIntoContainerAsync<T extends ContainerST>(imageUrl: string, container: T): Promise<void | SpriteST | undefined> {
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

            const sprite = new SpriteST(texture)
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
