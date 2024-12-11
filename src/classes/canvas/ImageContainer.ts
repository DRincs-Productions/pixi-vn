import { ContainerOptions, ObservablePoint, PointData, Texture } from "pixi.js";
import { canvas } from "../..";
import { CANVAS_IMAGE_CONTAINER_ID } from "../../constants";
import { ImageContainerMemory } from "../../interface";
import AdditionalPositionsExtension, { AdditionalPositionsExtensionProps } from "./AdditionalPositions";
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
export default class ImageContainer extends Container<ImageSprite, ImageContainerMemory> implements AnchorExtension, AdditionalPositionsExtension {
    constructor(options?: ContainerOptions<ImageSprite> & AnchorExtensionProps & AdditionalPositionsExtensionProps, textureAliases: string[] = []) {
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
    override get memory(): ImageContainerMemory {
        return {
            ...super.memory,
            pixivnId: CANVAS_IMAGE_CONTAINER_ID,
            anchor: this._anchor,
            align: this._align,
            loadIsStarted: this._loadIsStarted,
        }
    }
    override async setMemory(value: ImageContainerMemory) {
        await super.setMemory(value)
        this.reloadAnchor()
        this.reloadAlign()
    }
    pixivnId: string = CANVAS_IMAGE_CONTAINER_ID
    private _loadIsStarted: boolean = false
    get loadIsStarted() {
        return this._loadIsStarted
    }
    /** 
     * Load the children images.
     * @returns A promise that resolves when the images are loaded.
     */
    async load() {
        this._loadIsStarted = true
        let promises: Promise<void>[] = Array<Promise<void>>(this.children.length)
        for (let i = 0; i < this.children.length; i++) {
            promises[i] = this.children[i].load()
        }
        // wait for all promises
        return Promise.all(promises)
            .then(() => {
                this._loadIsStarted = false
                this.reloadAnchor()
                this.reloadAlign()
            })
            .catch((e) => {
                this._loadIsStarted = false
                console.error("[Pixi’VN] Error into ImageContainer.load()", e)
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
        this._align === undefined && (this._align = {})
        if (this._align.x !== undefined) {
            super.x = (this._align.x * (canvas.screen.width - this.width)) + this.pivot.x
        }
        if (this._align.y !== undefined) {
            super.y = (this._align.y * (canvas.screen.height - this.height)) + this.pivot.y
        }
    }
    get position(): ObservablePoint {
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
    get y(): number {
        return super.y
    }
    set y(value: number) {
        this._align === undefined && (this._align = {})
        this._align.y = undefined
        super.y = value
    }
}
