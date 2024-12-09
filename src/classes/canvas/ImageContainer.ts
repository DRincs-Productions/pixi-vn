import { ContainerOptions, ObservablePoint, PointData, Texture } from "pixi.js";
import { canvas } from "../..";
import { CANVAS_IMAGE_CONTAINER_ID } from "../../constants";
import { ImageContainerMemory } from "../../interface";
import AlignExtension, { AlignExtensionProps } from "./AlignExtension";
import AnchorExtension, { AnchorExtensionProps } from "./AnchorExtension";
import Container from "./Container";
import ImageSprite from "./ImageSprite";

/**
 * This class is a extension of the {@link Container}, it has the same properties and methods, 
 * but this container is composed only of {@link ImageSprite} and introduces the {@link ImageContainer.load} functionality
 * @example
 * ```typescript
 *  const liamBodyImageUrl = 'https://example.com/assets/liam/body.png';
 *  const liamHeadImageUrl = 'https://example.com/assets/liam/head.png';
 *  const container = new ImageContainer(undefined, [liamBodyImageUrl, liamHeadImageUrl]);
 *  await container.load()
 *  canvas.add(container);
 * ```
 */
export default class ImageContainer extends Container<ImageSprite, ImageContainerMemory> implements AnchorExtension, AlignExtension {
    constructor(options?: ContainerOptions<ImageSprite> & AnchorExtensionProps & AlignExtensionProps, textureAliases: string[] = []) {
        super(options)
        if (textureAliases) {
            textureAliases.forEach(textureAlias => {
                this.addChild(new ImageSprite(undefined, textureAlias))
            })
        }
        if (options?.anchor !== undefined) {
            this.anchor = options.anchor
        }
        if (options?.align !== undefined) {
            this.align = options.align
        }
    }
    override get memory() {
        let memory = super.memory
        memory.pixivnId = CANVAS_IMAGE_CONTAINER_ID
        memory.anchor = this._anchor
        memory.align = this._align
        return memory
    }
    override set memory(value) {
        super.memory = value
        this.reloadAnchor()
        this.reloadAlign()
    }
    pixivnId: string = CANVAS_IMAGE_CONTAINER_ID
    /** 
     * Load the children images.
     * @returns A promise that resolves when the images are loaded.
     */
    async load() {
        let list = this.children.map(child => {
            if (child instanceof ImageSprite) {
                return child.load()
            }
        })
        return Promise.all(list).then((res) => {
            this.reloadAnchor()
            this.reloadAlign()
            return res
        })
    }

    /**
     * The texture of the first child.
     * If there is no child, it returns a new {@link Texture}.
     */
    get texture() {
        if (this.children.length > 0) {
            return this.children[0].texture
        }
        return new Texture()
    }

    /**
     * Check if there is a child with the empty texture.
     * @returns A boolean that is true if there is a child with the empty texture.
     */
    get haveEmptyTexture() {
        return this.children.some(child => child.texture._source.label === "EMPTY")
    }

    /** Anchor */
    private _anchor?: PointData
    get anchor(): PointData {
        let x = super.pivot.x / this.width
        let y = super.pivot.y / this.height
        return { x, y }
    }
    set anchor(value: PointData | number) {
        if (typeof value === "number") {
            this._anchor = { x: value, y: value }
        }
        else {
            this._anchor = value
        }
        this.reloadAnchor()
    }
    private reloadAnchor() {
        if (this._anchor) {
            super.pivot.set(this._anchor.x * this.width, this._anchor.y * this.height)
        }
    }
    override get pivot() {
        return super.pivot
    }
    override set pivot(value: ObservablePoint) {
        this._anchor = undefined
        super.pivot = value
    }

    /** Align */
    private _align: Partial<PointData> = {}
    set align(value: Partial<PointData> | number) {
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
        this._align.x = value
        this.reloadAlign()
    }
    set yAlign(value: number) {
        this._align.y = value
        this.reloadAlign()
    }
    private reloadAlign() {
        if (this._align.x !== undefined) {
            this.x = (this._align.x * (canvas.screen.width - this.width)) + this.pivot.x
        }
        if (this._align.y !== undefined) {
            this.y = (this._align.y * (canvas.screen.height - this.height)) + this.pivot.y
        }
    }
    override get position(): ObservablePoint {
        return super.position
    }
    override set position(value: ObservablePoint) {
        this._align.x = undefined
        this._align.y = undefined
        super.position = value
    }
    override get x(): number {
        return super.x
    }
    override set x(value: number) {
        this._align.x = undefined
        super.x = value
    }
    override get y(): number {
        return super.y
    }
    override set y(value: number) {
        this._align.y = undefined
        super.y = value
    }
}
