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
} from "pixi.js";
import { CANVAS_CONTAINER_ID, CANVAS_SPRITE_ID, CANVAS_TEXT_ID } from "../../constants";
import { logger } from "../../utils/log-utility";
import { CanvasBaseInterface } from "../classes/CanvasBaseItem";
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
 * @returns Memory object of the texture
 */
function getTextureMemory(texture: Texture, alias?: string): TextureMemory {
    let url = texture.source.label;
    let textureMemory: TextureMemory = {
        url: url,
        alias: alias === url ? undefined : alias,
    };
    return textureMemory;
}

export function getMemoryContainer<T extends PixiContainer>(
    element: T,
    options?: {
        childrenExport?: boolean;
    }
): ContainerMemory {
    const className = Object.prototype.hasOwnProperty.call(element, "pixivnId")
        ? (element as any).pixivnId
        : CANVAS_CONTAINER_ID;

    const childrenExport = options?.childrenExport || false;
    const elements: CanvasBaseItemMemory[] = childrenExport
        ? element.children
              .sort((a, b) => element.getChildIndex(a) - element.getChildIndex(b))
              .map((child) => exportCanvasElement(child as CanvasBaseInterface<any>))
        : [];

    return {
        pixivnId: className,
        elements,
        ...extractCommonMemoryProperties(element),
    };
}

export function getMemorySprite<T extends PixiSprite>(element: T | PixiSprite): SpriteMemory {
    const baseMemory = getMemoryContainer(element);
    const className = baseMemory.pixivnId ?? CANVAS_SPRITE_ID;

    const onEvents = "onEvents" in element ? (element.onEvents as Record<string, any>) : {};
    const textureData =
        "textureAlias" in element
            ? getTextureMemory(element.texture, element.textureAlias as string)
            : getTextureMemory(element.texture);

    return {
        ...baseMemory,
        pixivnId: className,
        textureData,
        anchor: { x: element.anchor.x, y: element.anchor.y },
        roundPixels: element.roundPixels,
        onEvents,
    };
}

export function getMemoryText<T extends PixiText>(element: T | PixiText): TextMemory {
    const baseMemory = getMemoryContainer(element);
    const className = baseMemory.pixivnId ?? CANVAS_TEXT_ID;

    const onEvents = "onEvents" in element ? (element.onEvents as Record<string, any>) : {};

    return {
        ...baseMemory,
        pixivnId: className,
        anchor: { x: element.anchor.x, y: element.anchor.y },
        text: element.text,
        resolution: element.resolution,
        style: getTextStyle(element.style),
        roundPixels: element.roundPixels,
        onEvents,
    };
}

function getFillGradientFillPattern(
    prop: ColorSource | FillGradient | FillPattern | StrokeStyle,
    propName: keyof TextStyle
): ColorSource | undefined {
    if (typeof prop !== "object" || prop === null) {
        return prop;
    }
    // TODO: FillGradient and FillPattern are not supported yet
    logger.warn(`Text.style.${propName} is a FillGradient or FillPattern, this is not supported yet.`, prop);
    return undefined;
}

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
