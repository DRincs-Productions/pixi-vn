import type { ObservablePoint, PointData, Texture, TextureSource, TextureSourceLike } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { CANVAS_IMAGE_ID } from "../../constants";
import { logger } from "../../utils/log-utility";
import { default as RegisteredCanvasComponents } from "../decorators/canvas-element-decorator";
import { getMemorySprite } from "../functions/canvas-memory-utility";
import {
    calculateAlignByPosition,
    calculatePercentagePositionByPosition,
    calculatePositionByAlign,
    calculatePositionByPercentagePosition,
    getSuperHeight,
    getSuperPoint,
    getSuperWidth,
} from "../functions/canvas-property-utility";
import { showWithDissolve } from "../functions/canvas-transition";
import { addImage } from "../functions/image-utility";
import { getTexture } from "../functions/texture-utility";
import { ImageSpriteOptions } from "../interfaces/canvas-options";
import ImageSpriteMemory from "../interfaces/memory/ImageSpriteMemory";
import AdditionalPositionsExtension, { analizePositionsExtensionProps } from "./AdditionalPositionsExtension";
import Sprite, { setMemorySprite } from "./Sprite";

/**
 * This class is a extension of the {@link Sprite} class, it has the same properties and methods,
 * but it has some features that make texture management easier.
 * You need to use {@link ImageSprite.load()} to show the image in the canvas.
 * This class is used for functions like {@link addImage} and {@link showWithDissolve}.
 * @example
 * ```typescript
 * let alien = new ImageSprite({
 *     anchor: { x: 0.5, y: 0.5 },
 *     x: 100,
 *     y: 100,
 * }, 'https://pixijs.com/assets/eggHead.png')
 * await alien.load()
 * canvas.add("alien", alien)
 * ```
 * @example
 * ```typescript
 * let alien = addImage("alien", 'https://pixijs.com/assets/eggHead.png')
 * alien.anchor.set(0.5);
 * alien.x = 100
 * alien.y = 100
 * await alien.load()
 * ```
 */
export default class ImageSprite<Memory extends ImageSpriteMemory = ImageSpriteMemory>
    extends Sprite<Memory>
    implements AdditionalPositionsExtension
{
    pixivnId: string = CANVAS_IMAGE_ID;
    constructor(options?: ImageSpriteOptions | Omit<Texture, "on"> | undefined, textureAlias?: string) {
        options = analizePositionsExtensionProps(options as any);
        let align = undefined;
        let percentagePosition = undefined;
        if (options && "align" in options && options?.align !== undefined) {
            align = options.align;
            delete options.align;
        }
        if (options && "percentagePosition" in options && options?.percentagePosition !== undefined) {
            percentagePosition = options.percentagePosition;
            delete options.percentagePosition;
        }
        super(options);
        if (textureAlias) {
            this.textureAlias = textureAlias;
        }
        if (align) {
            this.align = align;
        }
        if (percentagePosition) {
            this.percentagePosition = percentagePosition;
        }
    }
    override get memory(): ImageSpriteMemory {
        return {
            ...getMemorySprite(this),
            pixivnId: this.pixivnId,
            align: this._align,
            percentagePosition: this._percentagePosition,
            loadIsStarted: this._loadIsStarted,
        };
    }
    override set memory(_value: ImageSpriteMemory) {}
    override async setMemory(value: ImageSpriteMemory) {
        this.memory = value;
        await setMemoryImageSprite(this, value);
        this.reloadPosition();
    }
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean) {
        let sprite = PIXI.Sprite.from(source, skipCache);
        let mySprite = new ImageSprite();
        mySprite.texture = sprite.texture;
        return mySprite;
    }
    private _loadIsStarted: boolean = false;
    get loadIsStarted() {
        return this._loadIsStarted;
    }
    /**
     * Load the image from the link and set the texture of the sprite.
     * @returns A promise that resolves when the image is loaded.
     */
    async load() {
        this._loadIsStarted = true;
        return getTexture(this.textureAlias)
            .then((texture) => {
                this._loadIsStarted = false;
                if (texture) {
                    this.texture = texture;
                }
            })
            .catch((e) => {
                this._loadIsStarted = false;
                logger.error("Error into ImageSprite.load()", e);
            });
    }

    override set texture(value: Texture<TextureSource<any>>) {
        super.texture = value;
        this.reloadPosition();
    }
    override get texture(): Texture<TextureSource<any>> {
        return super.texture;
    }

    /**
     * Check if the texture is empty.
     * @returns A boolean that is true if the texture is empty.
     */
    get haveEmptyTexture() {
        return this.texture._source.label === "EMPTY";
    }

    /** AdditionalPositions */
    private _align: Partial<PointData> | undefined = undefined;
    set align(value: Partial<PointData> | number) {
        this._percentagePosition = undefined;
        this._align === undefined && (this._align = {});
        if (typeof value === "number") {
            this._align.x = value;
            this._align.y = value;
        } else {
            value.x !== undefined && (this._align.x = value.x);
            value.y !== undefined && (this._align.y = value.y);
        }
        this.reloadPosition();
    }
    get align() {
        let superPivot = getSuperPoint(this.pivot, this.angle);
        let superScale = getSuperPoint(this.scale, this.angle);
        return {
            x: calculateAlignByPosition(
                "width",
                this.x,
                getSuperWidth(this),
                superPivot.x,
                superScale.x < 0,
                this.anchor.x,
            ),
            y: calculateAlignByPosition(
                "height",
                this.y,
                getSuperHeight(this),
                superPivot.y,
                superScale.y < 0,
                this.anchor.y,
            ),
        };
    }
    set xAlign(value: number) {
        this._percentagePosition = undefined;
        this._align === undefined && (this._align = {});
        this._align.x = value;
        this.reloadPosition();
    }
    get xAlign() {
        let superPivot = getSuperPoint(this.pivot, this.angle);
        let superScale = getSuperPoint(this.scale, this.angle);
        return calculateAlignByPosition(
            "width",
            this.x,
            getSuperWidth(this),
            superPivot.x,
            superScale.x < 0,
            this.anchor.x,
        );
    }
    set yAlign(value: number) {
        this._percentagePosition = undefined;
        this._align === undefined && (this._align = {});
        this._align.y = value;
        this.reloadPosition();
    }
    get yAlign() {
        let superPivot = getSuperPoint(this.pivot, this.angle);
        let superScale = getSuperPoint(this.scale, this.angle);
        return calculateAlignByPosition(
            "height",
            this.y,
            getSuperHeight(this),
            superPivot.y,
            superScale.y < 0,
            this.anchor.y,
        );
    }
    private _percentagePosition: Partial<PointData> | undefined = undefined;
    set percentagePosition(value: Partial<PointData> | number) {
        this._align = undefined;
        this._percentagePosition === undefined && (this._percentagePosition = {});
        if (typeof value === "number") {
            this._percentagePosition.x = value;
            this._percentagePosition.y = value;
        } else {
            value.x !== undefined && (this._percentagePosition.x = value.x);
            value.y !== undefined && (this._percentagePosition.y = value.y);
        }
        this.reloadPosition();
    }
    get percentagePosition() {
        return {
            x: calculatePercentagePositionByPosition("width", this.x),
            y: calculatePercentagePositionByPosition("height", this.y),
        };
    }
    get percentageX() {
        return calculatePercentagePositionByPosition("width", this.x);
    }
    set percentageX(_value: number) {
        this._align = undefined;
        this._percentagePosition === undefined && (this._percentagePosition = {});
        this._percentagePosition.x = _value;
        this.reloadPosition();
    }
    get percentageY() {
        return calculatePercentagePositionByPosition("height", this.y);
    }
    set percentageY(_value: number) {
        this._align = undefined;
        this._percentagePosition === undefined && (this._percentagePosition = {});
        this._percentagePosition.y = _value;
        this.reloadPosition();
    }
    get positionType(): "pixel" | "percentage" | "align" {
        if (this._align) {
            return "align";
        } else if (this._percentagePosition) {
            return "percentage";
        }
        return "pixel";
    }
    get positionInfo(): { x: number; y: number; type: "pixel" | "percentage" | "align" } {
        if (this._align) {
            return { x: this._align.x || 0, y: this._align.y || 0, type: "align" };
        } else if (this._percentagePosition) {
            return { x: this._percentagePosition.x || 0, y: this._percentagePosition.y || 0, type: "percentage" };
        }
        return { x: this.x, y: this.y, type: "pixel" };
    }
    set positionInfo(value: { x: number; y: number; type?: "pixel" | "percentage" | "align" }) {
        if (value.type === "align") {
            this.align = { x: value.x, y: value.y };
        } else if (value.type === "percentage") {
            this.percentagePosition = { x: value.x, y: value.y };
        } else {
            this.position.set(value.x, value.y);
        }
    }
    private reloadPosition() {
        if (this._align) {
            let superPivot = getSuperPoint(this.pivot, this.angle);
            let superScale = getSuperPoint(this.scale, this.angle);
            if (this._align.x !== undefined) {
                super.x = calculatePositionByAlign(
                    "width",
                    this._align.x,
                    getSuperWidth(this),
                    superPivot.x,
                    superScale.x < 0,
                    this.anchor.x,
                );
            }
            if (this._align.y !== undefined) {
                super.y = calculatePositionByAlign(
                    "height",
                    this._align.y,
                    getSuperHeight(this),
                    superPivot.y,
                    superScale.y < 0,
                    this.anchor.y,
                );
            }
        } else if (this._percentagePosition) {
            if (this._percentagePosition.x !== undefined) {
                super.x = calculatePositionByPercentagePosition("width", this._percentagePosition.x);
            }
            if (this._percentagePosition.y !== undefined) {
                super.y = calculatePositionByPercentagePosition("height", this._percentagePosition.y);
            }
        }
    }
    get position(): ObservablePoint {
        return super.position;
    }
    set position(value: ObservablePoint) {
        this._align = undefined;
        this._percentagePosition = undefined;
        super.position = value;
    }
    get x(): number {
        return super.x;
    }
    set x(value: number) {
        this._align = undefined;
        this._percentagePosition = undefined;
        super.x = value;
    }
    override get y(): number {
        return super.y;
    }
    override set y(value: number) {
        this._align = undefined;
        this._percentagePosition = undefined;
        super.y = value;
    }
}
RegisteredCanvasComponents.add(ImageSprite, CANVAS_IMAGE_ID);

export async function setMemoryImageSprite(
    element: ImageSprite,
    memory: ImageSpriteMemory | {},
    options?: {
        ignoreTexture?: boolean;
    },
) {
    let ignoreTexture = options?.ignoreTexture || false;
    memory = analizePositionsExtensionProps(memory)!;
    return await setMemorySprite(element, memory, {
        half: async () => {
            if (!ignoreTexture) {
                "imageLink" in memory && memory.imageLink !== undefined && (element.textureAlias = memory.imageLink);
            }
            if ("loadIsStarted" in memory && memory.loadIsStarted) {
                await element.load();
            }
            if ("anchor" in memory && memory.anchor !== undefined) {
                if (typeof memory.anchor === "number") {
                    element.anchor.set(memory.anchor, memory.anchor);
                } else {
                    element.anchor.set(memory.anchor.x, memory.anchor.y);
                }
            }
            "align" in memory && memory.align !== undefined && (element.align = memory.align);
            "percentagePosition" in memory &&
                memory.percentagePosition !== undefined &&
                (element.percentagePosition = memory.percentagePosition);
        },
        ignoreTexture: options?.ignoreTexture,
    });
}
