import { ObservablePoint, Sprite as PixiSprite, PointData, SpriteOptions, Texture, TextureSource, TextureSourceLike } from "pixi.js";
import { canvas } from "../..";
import { CANVAS_IMAGE_ID } from "../../constants";
import { addImage, loadImage, showWithDissolveTransition } from "../../functions";
import { getTexture } from "../../functions/texture-utility";
import { ImageSpriteMemory } from "../../interface";
import AlignExtension, { AlignExtensionProps } from "./AlignExtension";
import Sprite, { getMemorySprite } from "./Sprite";

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
export default class ImageSprite<Memory extends ImageSpriteMemory = ImageSpriteMemory> extends Sprite<Memory> implements AlignExtension {
    pixivnId: string = CANVAS_IMAGE_ID
    constructor(options?: (SpriteOptions & AlignExtensionProps) | Texture | undefined, textureAlias?: string) {
        super(options)
        if (textureAlias) {
            this.textureAlias = textureAlias
        }
        if (options && "align" in options && options?.align !== undefined) {
            this.align = options.align
        }
    }
    override get memory(): ImageSpriteMemory {
        return {
            ...getMemorySprite(this),
            pixivnId: this.pixivnId,
            align: this._align,
        }
    }
    override async setMemory(value: ImageSpriteMemory) {
        await super.setMemory(value)
        if ("imageLink" in value && value.imageLink) {
            this.textureAlias = value.imageLink
        }
        this.reloadAlign()
    }
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean) {
        let sprite = PixiSprite.from(source, skipCache)
        let mySprite = new ImageSprite()
        mySprite.texture = sprite.texture
        return mySprite
    }
    /** 
     * Load the image from the link and set the texture of the sprite.
     * @param image The link of the image. If it is not set, it will use the {@link Sprite.textureAlias} property.
     * @returns A promise that resolves when the image is loaded.
     */
    async load(image?: string) {
        if (!image) {
            image = this.textureAlias
        }
        return getTexture(this.textureAlias)
            .then((texture) => {
                if (texture) {
                    this.texture = texture
                }
            })
            .catch((e) => {
                console.error("[Pixi’VN] Error into ImageSprite.load()", e)
            })
    }

    override set texture(value: Texture<TextureSource<any>>) {
        super.texture = value
        // if this is initialized
        if (this) {
            this.reloadAlign()
        }
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

    /** Align */
    private _align: Partial<PointData> | undefined = undefined
    set align(value: Partial<PointData> | number) {
        this._align === undefined && (this._align = {})
        if (typeof value === "number") {
            this._align.x = value
            this._align.y = value
        } else {
            value.x !== undefined && (this._align.x = value.x)
            value.y !== undefined && (this._align.y = value.y)
        }
        this.reloadAlign()
    }
    set xAlign(value: number) {
        this._align === undefined && (this._align = {})
        this._align.x = value
        this.reloadAlign()
    }
    set yAlign(value: number) {
        this._align === undefined && (this._align = {})
        this._align.y = value
        this.reloadAlign()
    }
    private reloadAlign() {
        if (this._align) {
            if (this._align.x !== undefined) {
                super.x = (this._align.x * (canvas.screen.width - this.width)) + this.pivot.x
            }
            if (this._align.y !== undefined) {
                super.y = (this._align.y * (canvas.screen.height - this.height)) + this.pivot.y
            }
        }
    }
    override get position(): ObservablePoint {
        return super.position
    }
    set position(value: ObservablePoint) {
        this._align === undefined && (this._align = {})
        this._align.x = undefined
        this._align.y = undefined
        super.position = value
    }
    get x(): number {
        return super.x
    }
    set x(value: number) {
        this._align === undefined && (this._align = {})
        this._align.x = undefined
        super.x = value
    }
    override get y(): number {
        return super.y
    }
    override set y(value: number) {
        this._align === undefined && (this._align = {})
        this._align.y = undefined
        super.y = value
    }
}
