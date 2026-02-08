import type {
    ColorSource,
    FillGradient,
    FillInput,
    GradientOptions,
    Container as PixiContainer,
    Sprite as PixiSprite,
    Text as PixiText,
    StrokeInput,
    StrokeStyle,
    TextStyle,
    TextStyleOptions,
    Texture,
} from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { CANVAS_CONTAINER_ID, CANVAS_SPRITE_ID, CANVAS_TEXT_ID } from "../../constants";
import { logger } from "../../utils/log-utility";
import AssetMemory from "../interfaces/AssetMemory";
import { CanvasBaseInterface } from "../interfaces/CanvasBaseInterface";
import CanvasBaseItemMemory from "../interfaces/memory/CanvasBaseItemMemory";
import ContainerMemory from "../interfaces/memory/ContainerMemory";
import SpriteMemory from "../interfaces/memory/SpriteMemory";
import TextMemory from "../interfaces/memory/TextMemory";

/**
 * Export a Canvas element to a memory object
 * @param canvasComponent Canvas element
 * @returns Memory object of the canvas
 */
export function exportCanvasElement<T extends PixiContainer>(canvasComponent: T): CanvasBaseItemMemory {
    if ("memory" in canvasComponent) {
        return canvasComponent.memory as CanvasBaseItemMemory;
    } else if (canvasComponent instanceof PIXI.Text) {
        return getMemoryText(canvasComponent);
    } else if (canvasComponent instanceof PIXI.Sprite) {
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
function getTextureMemory(texture: Texture, alias?: string): AssetMemory {
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
    options?: { childrenExport?: boolean },
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
        "assetsAliases" in element && Array.isArray(element.assetsAliases)
            ? getTextureMemory(element.texture, element.assetsAliases[0] as string)
            : "textureAlias" in element
              ? getTextureMemory(element.texture, element.textureAlias as string)
              : getTextureMemory(element.texture);

    return {
        ...baseMemory,
        pixivnId,
        assetsData: [textureData],
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

function gradientToOptions(prop: FillGradient): GradientOptions {
    switch (prop.type) {
        case "linear":
            return {
                type: "linear",
                colorStops: prop.colorStops,
                end: { x: prop.end.x, y: prop.end.y },
                start: { x: prop.start.x, y: prop.start.y },
                textureSpace: prop.textureSpace,
                wrapMode: prop.texture.source.wrapMode,
                textureSize: prop.texture.source.width / prop.texture.source.height,
            };
        case "radial":
            return {
                type: "radial",
                colorStops: prop.colorStops,
                textureSpace: prop.textureSpace,
                center: { x: prop.center.x, y: prop.center.y },
                innerRadius: prop.innerRadius,
                outerCenter: { x: prop.outerCenter.x, y: prop.outerCenter.y },
                outerRadius: prop.outerRadius,
                rotation: prop.rotation,
                scale: prop.scale,
                wrapMode: prop.texture.source.wrapMode,
                textureSize: prop.texture.source.width / prop.texture.source.height,
            };
    }
}

/**
 * Handle fill gradient or fill pattern
 * @param prop Fill property
 * @returns Processed fill property
 */
function getFill(prop: FillInput | undefined | null): GradientOptions | undefined | string | number[] | number {
    if (prop === undefined || prop === null) {
        return undefined;
    } else if (typeof prop === "number") {
        return prop;
    } else if (typeof prop === "string" || Array.isArray(prop)) {
        return prop;
    } else if (prop instanceof PIXI.FillGradient) {
        return gradientToOptions(prop);
    } else if (typeof prop === "object" && "fill" in prop && typeof prop.fill !== "function") {
        if (!prop.fill) {
        } else if (prop.fill instanceof PIXI.FillPattern) {
        } else {
            return gradientToOptions(prop.fill);
        }
    }
    logger.warn(`Unsupported property type for Text.style.fill.`, prop);
    return undefined;
}

function convertColor(color?: ColorSource): string | number | number[] | undefined {
    if (typeof color === "number") {
        return color;
    } else if (typeof color === "string") {
        return color;
    } else if (Array.isArray(color)) {
        return color;
    } else if (color instanceof PIXI.Color) {
        return color.toNumber();
    }
    logger.warn(`Unsupported color type.`, color);
}

/**
 * Handle stroke
 * @param prop Stroke property
 * @returns Processed stroke property
 */
function getStroke(prop: StrokeInput | undefined | null): GradientOptions | undefined | string | number[] | number {
    if (prop === undefined || prop === null) {
        return undefined;
    } else if (typeof prop === "number") {
        return prop;
    } else if (typeof prop === "string" || Array.isArray(prop)) {
        return prop;
    } else if (prop instanceof PIXI.FillGradient) {
        return gradientToOptions(prop);
    } else if (typeof prop === "object" && "alignment" in prop) {
        const strokeProp: StrokeStyle = {
            alignment: prop.alignment,
            alpha: prop.alpha,
            color: convertColor(prop.color),
            join: prop.join,
            miterLimit: prop.miterLimit,
            width: prop.width,
            cap: prop.cap,
            // texture: prop.texture,
            // fill: getFill(prop.fill),
            // matrix: prop.matrix,
            pixelLine: prop.pixelLine,
            textureSpace: prop.textureSpace,
        };
        return strokeProp;
    } else if (typeof prop === "object" && "fill" in prop && typeof prop.fill !== "function") {
        if (!prop.fill) {
        } else if (prop.fill instanceof PIXI.FillPattern) {
        } else {
            return gradientToOptions(prop.fill);
        }
    }
    logger.warn(`Unsupported property type for Text.style.stroke.`, prop);
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
        fill: getFill(style.fill),
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontStyle: style.fontStyle,
        fontVariant: style.fontVariant,
        fontWeight: style.fontWeight,
        leading: style.leading,
        letterSpacing: style.letterSpacing,
        lineHeight: style.lineHeight,
        padding: style.padding,
        stroke: getStroke(style.stroke),
        textBaseline: style.textBaseline,
        trim: style.trim,
        whiteSpace: style.whiteSpace,
        wordWrap: style.wordWrap,
        wordWrapWidth: style.wordWrapWidth,
    };
}
