import { Assets, Container, Sprite, Texture } from 'pixi.js';
import { STRING_ERRORS, showErrorText } from './error';
import { Manager } from './manager';
import { Scene } from './scene';

export function showImage(id: string, imageUrl: string): Scene | undefined {
    const scene = new Scene()
    try {
        Manager.addChild(id, scene)
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

export function showImageIntoContainer(imageUrl: string, container: Container): Sprite | undefined {
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

    let character = new Sprite(texture)
    container.addChild(character)
    return character
}

export async function showImageAsync(id: string, imageUrl: string): Promise<void | Scene | undefined> {
    const scene = new Scene()
    try {
        Manager.addChild(id, scene)
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

export async function showImageIntoContainerAsync(imageUrl: string, container: Scene): Promise<void | Sprite | undefined> {
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

            const character = new Sprite(texture)
            container.addChild(character)
            return character
        })
        .catch(() => {
            showErrorText(STRING_ERRORS.IMAGE_NOT_FOUND, container)
            console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
            return
        })
}

export function hideImage(id: string) {
    Manager.removeChild(id)
}
