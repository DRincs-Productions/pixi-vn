import { ObservablePoint, PointData, Texture } from "pixi.js";
import { canvas } from "../..";
import { CANVAS_IMAGE_CONTAINER_ID } from "../../constants";
import { ImageContainerMemory, ImageContainerOptions } from "../../interface";
import AdditionalPositionsExtension, { analizePositionsExtensionProps } from "./AdditionalPositions";
import AnchorExtension from "./AnchorExtension";
import Container, { setMemoryContainer } from "./Container";
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
    constructor(options?: ImageContainerOptions<ImageSprite>, textureAliases: string[] = []) {
        super(options)
        options = analizePositionsExtensionProps(options)
        if (textureAliases) {
            textureAliases.forEach(textureAlias => {
                this.addChild(new ImageSprite(undefined, textureAlias))
            })
        }
        if (options?.anchor !== undefined) {
            this.anchor = options.anchor
        }
        if (options && "align" in options && options?.align !== undefined) {
            this.align = options.align
        }
        if (options && "percentagePosition" in options && options?.percentagePosition !== undefined) {
            this.percentagePosition = options.percentagePosition
        }
    }
    override get memory(): ImageContainerMemory {
        return {
            ...super.memory,
            pixivnId: CANVAS_IMAGE_CONTAINER_ID,
            anchor: this._anchor,
            align: this._align,
            percentagePosition: this._percentagePosition,
            loadIsStarted: this._loadIsStarted,
        }
    }
    override set memory(value: ImageContainerMemory) {
        this.setMemory(value)
    }
    override async setMemory(value: ImageContainerMemory) {
        await super.setMemory(value)
        this.reloadAnchor()
        this.reloadPosition()
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
                this.reloadPosition()
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
        if (this._percentagePosition) {
            this._percentagePosition.x = undefined
        }
        this._align === undefined && (this._align = {})
        this._align.x = value
        this.reloadPosition()
    }
    set yAlign(value: number) {
        if (this._percentagePosition) {
            this._percentagePosition.y = undefined
        }
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
        if (this._align) {
            this._align.x = undefined
        }
        this._percentagePosition === undefined && (this._percentagePosition = {})
        this._percentagePosition.x = _value
        this.reloadPosition()
    }
    set yPercentagePosition(_value: number) {
        if (this._align) {
            this._align.y = undefined
        }
        this._percentagePosition === undefined && (this._percentagePosition = {})
        this._percentagePosition.y = _value
        this.reloadPosition()
    }
    private reloadPosition() {
        if (this._align) {
            if (this._align.x !== undefined) {
                super.x = (this._align.x * (canvas.screen.width - this.width)) + this.pivot.x
            }
            if (this._align.y !== undefined) {
                super.y = (this._align.y * (canvas.screen.height - this.height)) + this.pivot.y
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

export async function setMemoryImageContainer(element: ImageContainer, memory: ImageContainerOptions | {}, opstions?: {
    ignoreScale?: boolean,
}) {
    setMemoryContainer(element, memory, {
        ...opstions,
        end: async () => {
            "anchor" in memory && memory.anchor !== undefined && (element.anchor = memory.anchor as number | PointData)
            "align" in memory && memory.align !== undefined && (element.align = memory.align as Partial<PointData>)
            if ("loadIsStarted" in memory && memory.loadIsStarted) {
                await element.load()
            }
        }
    })
}
