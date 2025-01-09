import { ObservablePoint, Sprite as PixiSprite, PointData, Texture, TextureSource, TextureSourceLike } from "pixi.js";
import { CANVAS_IMAGE_ID } from "../../constants";
import { addImage, getTexture, showWithDissolveTransition } from "../../functions";
import { getMemorySprite } from "../../functions/canvas/canvas-memory-utility";
import { calculateAlignByPosition, calculatePercentagePositionByPosition, calculatePositionByAlign, calculatePositionByPercentagePosition, getSuperHeight, getSuperPivot, getSuperWidth } from "../../functions/canvas/canvas-property-utility";
import { ImageSpriteMemory, ImageSpriteOptions } from "../../interface";
import AdditionalPositionsExtension, { analizePositionsExtensionProps } from "./AdditionalPositions";
import Sprite, { setMemorySprite } from "./Sprite";

/**
 * This class is a extension of the {@link Sprite} class, it has the same properties and methods,
 * but it has some features that make texture management easier.
 * You need to use {@link ImageSprite.load()} to show the image in the canvas.
 * This class is used for functions like {@link addImage} and {@link showWithDissolveTransition}.
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
export default class ImageSprite<Memory extends ImageSpriteMemory = ImageSpriteMemory> extends Sprite<Memory> implements AdditionalPositionsExtension {
    pixivnId: string = CANVAS_IMAGE_ID
    constructor(options?: ImageSpriteOptions | Texture | undefined, textureAlias?: string) {
        options = analizePositionsExtensionProps(options as any)
        let align = undefined
        let percentagePosition = undefined
        if (options && "align" in options && options?.align !== undefined) {
            align = options.align
            delete options.align
        }
        if (options && "percentagePosition" in options && options?.percentagePosition !== undefined) {
            percentagePosition = options.percentagePosition
            delete options.percentagePosition
        }
        super(options)
        if (textureAlias) {
            this.textureAlias = textureAlias
        }
        if (align) {
            this.align = align
        }
        if (percentagePosition) {
            this.percentagePosition = percentagePosition
        }
    }
    override get memory(): ImageSpriteMemory {
        return {
            ...getMemorySprite(this),
            pixivnId: this.pixivnId,
            align: this._align,
            percentagePosition: this._percentagePosition,
            loadIsStarted: this._loadIsStarted,
        }
    }
    override set memory(value: ImageSpriteMemory) {
        this.setMemory(value)
    }
    override async setMemory(value: ImageSpriteMemory) {
        await setMemoryImageSprite(this, value)
        this.reloadPosition()
    }
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean) {
        let sprite = PixiSprite.from(source, skipCache)
        let mySprite = new ImageSprite()
        mySprite.texture = sprite.texture
        return mySprite
    }
    private _loadIsStarted: boolean = false
    get loadIsStarted() {
        return this._loadIsStarted
    }
    /** 
     * Load the image from the link and set the texture of the sprite.
     * @returns A promise that resolves when the image is loaded.
     */
    async load() {
        this._loadIsStarted = true
        return getTexture(this.textureAlias)
            .then((texture) => {
                this._loadIsStarted = false
                if (texture) {
                    this.texture = texture
                }
            })
            .catch((e) => {
                this._loadIsStarted = false
                console.error("[Pixi’VN] Error into ImageSprite.load()", e)
            })
    }

    override set texture(value: Texture<TextureSource<any>>) {
        super.texture = value
        this.reloadPosition()
    }
    override get texture(): Texture<TextureSource<any>> {
        return super.texture
    }

    /**
     * Check if the texture is empty.
     * @returns A boolean that is true if the texture is empty.
     */
    get haveEmptyTexture() {
        return this.texture._source.label === "EMPTY"
    }

    /** AdditionalPositions */
    private _align: Partial<PointData> | undefined = undefined
    set align(value: Partial<PointData> | number) {
        this._percentagePosition = undefined
        this._align === undefined && (this._align = {})
        if (typeof value === "number") {
            this._align.x = value
            this._align.y = value
        } else {
            value.x !== undefined && (this._align.x = value.x)
            value.y !== undefined && (this._align.y = value.y)
        }
        this.reloadPosition()
    }
    get align() {
        let superPivot = getSuperPivot(this)
        return {
            x: calculateAlignByPosition("width", this.x, getSuperWidth(this), superPivot.x, this.anchor.x),
            y: calculateAlignByPosition("height", this.y, getSuperHeight(this), superPivot.y, this.anchor.y),
        }
    }
    set xAlign(value: number) {
        this._percentagePosition = undefined
        this._align === undefined && (this._align = {})
        this._align.x = value
        this.reloadPosition()
    }
    get xAlign() {
        let superPivot = getSuperPivot(this)
        return calculateAlignByPosition("width", this.x, getSuperWidth(this), superPivot.x, this.anchor.x)
    }
    set yAlign(value: number) {
        this._percentagePosition = undefined
        this._align === undefined && (this._align = {})
        this._align.y = value
        this.reloadPosition()
    }
    get yAlign() {
        let superPivot = getSuperPivot(this)
        return calculateAlignByPosition("height", this.y, getSuperHeight(this), superPivot.y, this.anchor.y)
    }
    private _percentagePosition: Partial<PointData> | undefined = undefined
    set percentagePosition(value: Partial<PointData> | number) {
        this._align = undefined
        this._percentagePosition === undefined && (this._percentagePosition = {})
        if (typeof value === "number") {
            this._percentagePosition.x = value
            this._percentagePosition.y = value
        } else {
            value.x !== undefined && (this._percentagePosition.x = value.x)
            value.y !== undefined && (this._percentagePosition.y = value.y)
        }
        this.reloadPosition()
    }
    get percentagePosition() {
        return {
            x: calculatePercentagePositionByPosition("width", this.x),
            y: calculatePercentagePositionByPosition("height", this.y),
        }
    }
    get xPercentagePosition() {
        return calculatePercentagePositionByPosition("width", this.x)
    }
    set xPercentagePosition(_value: number) {
        this._align = undefined
        this._percentagePosition === undefined && (this._percentagePosition = {})
        this._percentagePosition.x = _value
        this.reloadPosition()
    }
    get yPercentagePosition() {
        return calculatePercentagePositionByPosition("height", this.y)
    }
    set yPercentagePosition(_value: number) {
        this._align = undefined
        this._percentagePosition === undefined && (this._percentagePosition = {})
        this._percentagePosition.y = _value
        this.reloadPosition()
    }
    get positionType(): "pixel" | "percentage" | "align" {
        if (this._align) {
            return "align"
        }
        else if (this._percentagePosition) {
            return "percentage"
        }
        return "pixel"
    }
    get positionInfo(): { x: number; y: number; type: "pixel" | "percentage" | "align"; } {
        if (this._align) {
            return { x: this._align.x || 0, y: this._align.y || 0, type: "align" }
        }
        else if (this._percentagePosition) {
            return { x: this._percentagePosition.x || 0, y: this._percentagePosition.y || 0, type: "percentage" }
        }
        return { x: this.x, y: this.y, type: "pixel" }
    }
    private reloadPosition() {
        if (this._align) {
            let superPivot = getSuperPivot(this)
            if (this._align.x !== undefined) {
                super.x = calculatePositionByAlign("width", this._align.x, getSuperWidth(this), superPivot.x, this.anchor.x)
            }
            if (this._align.y !== undefined) {
                super.y = calculatePositionByAlign("height", this._align.y, getSuperHeight(this), superPivot.y, this.anchor.y)
            }
        }
        else if (this._percentagePosition) {
            if (this._percentagePosition.x !== undefined) {
                super.x = calculatePositionByPercentagePosition("width", this._percentagePosition.x)
            }
            if (this._percentagePosition.y !== undefined) {
                super.y = calculatePositionByPercentagePosition("height", this._percentagePosition.y)
            }
        }
    }
    get position(): ObservablePoint {
        return super.position
    }
    set position(value: ObservablePoint) {
        this._align = undefined
        this._percentagePosition = undefined
        super.position = value
    }
    get x(): number {
        return super.x
    }
    set x(value: number) {
        this._align = undefined
        this._percentagePosition = undefined
        super.x = value
    }
    override get y(): number {
        return super.y
    }
    override set y(value: number) {
        this._align = undefined
        this._percentagePosition = undefined
        super.y = value
    }
}

export async function setMemoryImageSprite(element: ImageSprite, memory: ImageSpriteMemory | {}, options?: {
    ignoreTexture?: boolean,
}) {
    let ignoreTexture = options?.ignoreTexture || false
    memory = analizePositionsExtensionProps(memory)!
    return await setMemorySprite(element, memory, {
        half: async () => {
            "align" in memory && memory.align !== undefined && (element.align = memory.align)
            "percentagePosition" in memory && memory.percentagePosition !== undefined && (element.percentagePosition = memory.percentagePosition)
            if (!ignoreTexture) {
                "imageLink" in memory && memory.imageLink !== undefined && (element.textureAlias = memory.imageLink)
            }
            if ("loadIsStarted" in memory && memory.loadIsStarted) {
                await element.load()
            }
        },
        ignoreTexture: options?.ignoreTexture,
    })
}
