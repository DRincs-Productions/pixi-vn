import { ObservablePoint, Sprite as PixiSprite, PointData, Texture, TextureSource, TextureSourceLike } from "pixi.js";
import { canvas } from "../..";
import { CANVAS_IMAGE_ID } from "../../constants";
import { addImage, loadImage, showWithDissolveTransition } from "../../functions";
import { getTexture } from "../../functions/texture-utility";
import { ImageSpriteMemory, ImageSpriteOptions } from "../../interface";
import AdditionalPositionsExtension from "./AdditionalPositions";
import Sprite, { getMemorySprite, setMemorySprite } from "./Sprite";

/**
 * This class is a extension of the {@link Sprite} class, it has the same properties and methods,
 * but it has some features that make texture management easier.
 * You need to use {@link ImageSprite.load()} to show the image in the canvas.
 * This class is used for functions like {@link addImage}, {@link loadImage} and {@link showWithDissolveTransition}.
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
        super(options)
        if (textureAlias) {
            this.textureAlias = textureAlias
        }
        if (options && "align" in options && options?.align !== undefined) {
            this.align = options.align
        }
        if (options && "percentagePosition" in options && options?.percentagePosition !== undefined) {
            this.percentagePosition = options.percentagePosition
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
        await super.setMemory(value)
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
    set xAlign(value: number) {
        this._percentagePosition = undefined
        this._align === undefined && (this._align = {})
        this._align.x = value
        this.reloadPosition()
    }
    set yAlign(value: number) {
        this._percentagePosition = undefined
        this._align === undefined && (this._align = {})
        this._align.y = value
        this.reloadPosition()
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
    set xPercentagePosition(_value: number) {
        this._align = undefined
        this._percentagePosition === undefined && (this._percentagePosition = {})
        this._percentagePosition.x = _value
        this.reloadPosition()
    }
    set yPercentagePosition(_value: number) {
        this._align = undefined
        this._percentagePosition === undefined && (this._percentagePosition = {})
        this._percentagePosition.y = _value
        this.reloadPosition()
    }
    private reloadPosition() {
        if (this._align) {
            if (this._align.x !== undefined) {
                super.x = (this._align.x * (canvas.screen.width - this.width)) + this.pivot.x + (this.anchor.x * this.width)
            }
            if (this._align.y !== undefined) {
                super.y = (this._align.y * (canvas.screen.height - this.height)) + this.pivot.y + (this.anchor.y * this.height)
            }
        }
        else if (this._percentagePosition) {
            if (this._percentagePosition.x !== undefined) {
                super.x = (this._percentagePosition.x * canvas.screen.width)
            }
            if (this._percentagePosition.y !== undefined) {
                super.y = (this._percentagePosition.y * canvas.screen.height)
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

export async function setMemoryImageSprite(element: ImageSprite, memory: ImageSpriteMemory | {}) {
    return await setMemorySprite(element, memory, {
        half: async () => {
            "align" in memory && memory.align !== undefined && (element.align = memory.align)
            "imageLink" in memory && memory.imageLink !== undefined && (element.textureAlias = memory.imageLink)
            if ("loadIsStarted" in memory && memory.loadIsStarted) {
                await element.load()
            }
        }
    })
}
