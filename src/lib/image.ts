import * as PIXI from 'pixi.js';

const STRING_ERRORS = {
    IMAGE_NOT_FOUND: "texture not found",
    FILE_NOT_IS_IMAGE: "file not is a image",
}

export async function showImage(imageUrl: string, container: PIXI.Container): Promise<void | PIXI.Sprite | undefined> {
    let texture: PIXI.Texture | undefined = undefined
    try {
        texture = PIXI.Texture.from(imageUrl);
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
    if (!(texture instanceof PIXI.Texture)) {
        showErrorText(STRING_ERRORS.FILE_NOT_IS_IMAGE, container)
        console.error(STRING_ERRORS.FILE_NOT_IS_IMAGE, imageUrl)
        return
    }

    let character = new PIXI.Sprite(texture);
    container.addChild(character);
    return character
}

export async function showImageAsync(imageUrl: string, container: PIXI.Container): Promise<void | PIXI.Sprite | undefined> {
    return PIXI.Assets.load(imageUrl).then((texture) => {
        if (!texture) {
            showErrorText(STRING_ERRORS.IMAGE_NOT_FOUND, container)
            console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
            return
        }
        // if texture not is a Texture, then it is a TextureResource
        if (!(texture instanceof PIXI.Texture)) {
            showErrorText(STRING_ERRORS.FILE_NOT_IS_IMAGE, container)
            console.error(STRING_ERRORS.FILE_NOT_IS_IMAGE, imageUrl)
            return
        }

        const character = new PIXI.Sprite(texture);
        container.addChild(character);
        return character
    }).catch(() => {
        showErrorText(STRING_ERRORS.IMAGE_NOT_FOUND, container)
        console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
        return
    })
}

export function showErrorText(string: string, container: PIXI.Container) {
    const text = new PIXI.Text(string)
    container.addChild(text);
}