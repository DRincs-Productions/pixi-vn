import { Assets, TextStyle, TextStyleOptions, Texture } from 'pixi.js';
import { STRING_ERRORS } from './ErrorUtility';

/**
 * Get a texture from a url.
 * @param imageUrl is the url of the image.
 * @returns the texture of the image, or a text with the error.
 */
export async function getTexture(imageUrl: string): Promise<Texture | string> {
    if (Assets.cache.has(imageUrl)) {
        return Assets.get(imageUrl)
    }
    return Assets.load(imageUrl)
        .then((texture) => {
            if (!texture) {
                console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
                return STRING_ERRORS.IMAGE_NOT_FOUND
            }
            // if texture not is a Texture, then it is a TextureResource
            if (!(texture instanceof Texture)) {
                console.error(STRING_ERRORS.FILE_NOT_IS_IMAGE, imageUrl)
                return STRING_ERRORS.FILE_NOT_IS_IMAGE
            }

            return texture
        })
        .catch(() => {
            console.error(STRING_ERRORS.IMAGE_NOT_FOUND, imageUrl)
            return STRING_ERRORS.IMAGE_NOT_FOUND
        })
}

export function getTextStyle(style: TextStyle): TextStyleOptions {
    return {
        align: style.align,
        breakWords: style.breakWords,
        dropShadow: style.dropShadow,
        fill: style.fill,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontStyle: style.fontStyle,
        fontVariant: style.fontVariant,
        fontWeight: style.fontWeight,
        leading: style.leading,
        letterSpacing: style.letterSpacing,
        lineHeight: style.lineHeight,
        padding: style.padding,
        stroke: style.stroke,
        textBaseline: style.textBaseline,
        trim: style.trim,
        whiteSpace: style.whiteSpace,
        wordWrap: style.wordWrap,
        wordWrapWidth: style.wordWrapWidth,
    }
}
