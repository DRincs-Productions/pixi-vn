import {
    Assets,
    ColorSource,
    FillGradient,
    FillPattern,
    StrokeStyle,
    TextStyle,
    TextStyleOptions,
    Texture,
} from "pixi.js";
import { logger } from "../log-utility";

/**
 * Get a texture from a url.
 * @param textureAlias is the url of the file.
 * @returns the texture of the image or video, or a text with the error.
 */
export async function getTexture(textureAlias?: string): Promise<Texture | void> {
    if (textureAlias === "EMPTY") {
        return;
    }
    if (!textureAlias) {
        console.error("Texture not found", textureAlias);
        return;
    }
    if (Assets.cache.has(textureAlias)) {
        let texture = Assets.get(textureAlias);
        if (texture) {
            return texture;
        }
    }
    return Assets.load(textureAlias)
        .then((texture) => {
            if (!texture) {
                console.error("Texture not found", textureAlias);
                return;
            }
            // if texture not is a Texture, then it is a TextureResource
            if (!(texture instanceof Texture)) {
                console.error("File not is a file", textureAlias);
                return;
            }

            return texture;
        })
        .catch((e) => {
            console.error("Error loading file", e);
            return;
        });
}

function getFillGradientFillPattern(
    prop: ColorSource | FillGradient | FillPattern | StrokeStyle,
    propName: keyof TextStyle
) {
    if (!(prop instanceof Object)) {
        return prop;
    }
    // TODO: FillGradient and FillPattern are not supported yet
    logger.warn(`Text.style.${propName} is a FillGradient or FillPattern, this is not supported yet.`, prop);
    return undefined;
}

export function getTextStyle(style: TextStyle): TextStyleOptions {
    return {
        align: style.align,
        breakWords: style.breakWords,
        dropShadow: style.dropShadow,
        fill: getFillGradientFillPattern(style.stroke, "fill"),
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontStyle: style.fontStyle,
        fontVariant: style.fontVariant,
        fontWeight: style.fontWeight,
        leading: style.leading,
        letterSpacing: style.letterSpacing,
        lineHeight: style.lineHeight,
        padding: style.padding,
        stroke: getFillGradientFillPattern(style.stroke, "stroke"),
        textBaseline: style.textBaseline,
        trim: style.trim,
        whiteSpace: style.whiteSpace,
        wordWrap: style.wordWrap,
        wordWrapWidth: style.wordWrapWidth,
    };
}
