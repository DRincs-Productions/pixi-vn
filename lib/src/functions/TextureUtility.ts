import { Assets, TextStyle, TextStyleOptions, Texture } from 'pixi.js';

/**
 * Get a texture from a url.
 * @param imageUrl is the url of the image.
 * @returns the texture of the image, or a text with the error.
 */
export async function getTexture(imageUrl: string): Promise<Texture | void> {
    if (Assets.cache.has(imageUrl)) {
        return Assets.get(imageUrl)
    }
    return Assets.load(imageUrl)
        .then((texture) => {
            if (!texture) {
                console.error("[Pixi'VM] Texture not found", imageUrl)
                return
            }
            // if texture not is a Texture, then it is a TextureResource
            if (!(texture instanceof Texture)) {
                console.error("[Pixi'VM] File not is a image", imageUrl)
                return
            }

            return texture
        })
        .catch((e) => {
            console.error("[Pixi'VM] Error loading image", e)
            return
        })
}

export function getTextStyle(style: TextStyle): TextStyleOptions {
    let fill = style.fill
    if (fill instanceof Object) {
        // TODO: FillGradient and FillPattern are not supported yet
        console.warn("[Pixi'VM] CanvasText.style.fill is a FillGradient or FillPattern, this is not supported yet.", fill)
        fill = "#00FF00"
    }
    return {
        align: style.align,
        breakWords: style.breakWords,
        dropShadow: style.dropShadow,
        fill: fill,
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
