import {
    ColorSource,
    FillGradient,
    FillPattern,
    Container as PixiContainer,
    Sprite as PixiSprite,
    Text as PixiText,
    StrokeStyle,
    TextStyle,
    TextStyleOptions,
    Texture,
} from "@drincs/pixi-vn/pixi.js";
import { CANVAS_CONTAINER_ID, CANVAS_SPRITE_ID, CANVAS_TEXT_ID } from "../../constants";
import { logger } from "../../utils/log-utility";
import { CanvasBaseInterface } from "../interfaces/CanvasBaseInterface";
import CanvasBaseItemMemory from "../interfaces/memory/CanvasBaseItemMemory";
import ContainerMemory from "../interfaces/memory/ContainerMemory";
import SpriteMemory from "../interfaces/memory/SpriteMemory";
import TextMemory from "../interfaces/memory/TextMemory";
import TextureMemory from "../interfaces/TextureMemory";

/**
 * Export a Canvas element to a memory object
 * @param canvasComponent Canvas element
 * @returns Memory object of the canvas
 */
export function exportCanvasElement<T extends PixiContainer>(canvasComponent: T): CanvasBaseItemMemory {
    if ("memory" in canvasComponent) {
        return canvasComponent.memory as CanvasBaseItemMemory;
    } else if (canvasComponent instanceof PixiText) {
        return getMemoryText(canvasComponent);
    } else if (canvasComponent instanceof PixiSprite) {
        return getMemorySprite(canvasComponent);
    } else {
        return getMemoryContainer(canvasComponent);
    }
}

/**
 * Extract common properties for memory objects
 */
function extractCommonMemoryProperties<T extends PixiContainer>(element: T): Partial<ContainerMemory> {
    return {
        width: element.width,
        height: element.height,
        isRenderGroup: element.isRenderGroup,
        blendMode: element.blendMode,
        tint: element.tint,
        alpha: element.alpha,
        angle: element.angle,
        renderable: element.renderable,
        rotation: element.rotation,
        scale: { x: element.scale.x, y: element.scale.y },
        pivot: { x: element.pivot.x, y: element.pivot.y },
        position: { x: element.position.x, y: element.position.y },
        skew: { x: element.skew.x, y: element.skew.y },
        visible: element.visible,
        x: element.x,
        y: element.y,
        boundsArea: element.boundsArea,
        cursor: element.cursor,
        eventMode: element.eventMode,
        interactive: element.interactive,
        interactiveChildren: element.interactiveChildren,
        hitArea: element.hitArea,
    };
}

/**
 * Get the memory object of the PixiJS texture
 * @param texture PixiJS Texture object
 * @param alias Optional alias for the texture
 * @returns Memory object of the texture
 */
function getTextureMemory(texture: Texture, alias?: string): TextureMemory {
    return {
        url: texture.source.label,
        alias: alias === texture.source.label ? undefined : alias,
    };
}

/**
 * Get the memory object of a container
 * @param element PixiJS container element
 * @param options Optional export options
 * @returns Memory object of the container
 */
export function getMemoryContainer<T extends PixiContainer>(
    element: T,
    options?: { childrenExport?: boolean }
): ContainerMemory {
    const pixivnId = getPixivnId(element, CANVAS_CONTAINER_ID);
    const childrenExport = options?.childrenExport || false;

    const elements: CanvasBaseItemMemory[] = childrenExport
        ? element.children
              .sort((a, b) => element.getChildIndex(a) - element.getChildIndex(b))
              .map((child) => exportCanvasElement(child as CanvasBaseInterface<any>))
        : [];

    return {
        pixivnId,
        elements,
        ...extractCommonMemoryProperties(element),
    };
}

/**
 * Get the memory object of a sprite
 * @param element PixiJS sprite element
 * @returns Memory object of the sprite
 */
export function getMemorySprite<T extends PixiSprite>(element: T | PixiSprite): SpriteMemory {
    const baseMemory = getMemoryContainer(element);
    const pixivnId = baseMemory.pixivnId ?? CANVAS_SPRITE_ID;
    const onEvents = getOnEvents(element);
    const textureData =
        "textureAlias" in element
            ? getTextureMemory(element.texture, element.textureAlias as string)
            : getTextureMemory(element.texture);

    return {
        ...baseMemory,
        pixivnId,
        textureData,
        anchor: { x: element.anchor.x, y: element.anchor.y },
        roundPixels: element.roundPixels,
        onEvents,
    };
}

/**
 * Get the memory object of a text element
 * @param element PixiJS text element
 * @returns Memory object of the text
 */
export function getMemoryText<T extends PixiText>(element: T | PixiText): TextMemory {
    const baseMemory = getMemoryContainer(element);
    const pixivnId = baseMemory.pixivnId ?? CANVAS_TEXT_ID;
    const onEvents = getOnEvents(element);

    return {
        ...baseMemory,
        pixivnId,
        anchor: { x: element.anchor.x, y: element.anchor.y },
        text: element.text,
        resolution: element.resolution,
        style: getTextStyle(element.style),
        roundPixels: element.roundPixels,
        onEvents,
    };
}

/**
 * Get the Pixivn ID of an element
 * @param element PixiJS element
 * @param defaultId Default ID to use if none is found
 * @returns Pixivn ID
 */
function getPixivnId(element: any, defaultId: string): string {
    return Object.prototype.hasOwnProperty.call(element, "pixivnId") ? element.pixivnId : defaultId;
}

/**
 * Get the onEvents property of an element
 * @param element PixiJS element
 * @returns onEvents object
 */
function getOnEvents(element: any): Record<string, any> {
    return "onEvents" in element ? (element.onEvents as Record<string, any>) : {};
}

/**
 * Handle fill gradient or fill pattern
 * @param prop Fill property
 * @param propName Property name
 * @returns Processed fill property
 */
function getFillGradientFillPattern(
    prop: ColorSource | FillGradient | FillPattern | StrokeStyle,
    propName: keyof TextStyle
): ColorSource | undefined {
    if (typeof prop !== "object" || prop === null) {
        return prop;
    }
    // TODO: FillGradient and FillPattern are not supported yet
    logger.warn(`Unsupported property type for Text.style.${propName}: FillGradient or FillPattern.`, prop);
    return undefined;
}

/**
 * Get the text style options
 * @param style PixiJS text style
 * @returns Text style options
 */
function getTextStyle(style: TextStyle): TextStyleOptions {
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
