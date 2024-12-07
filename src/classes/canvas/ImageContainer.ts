import { ContainerOptions, PointData, Texture } from "pixi.js";
import { CANVAS_IMAGE_CONTAINER_ID } from "../../constants";
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
export default class ImageContainer extends Container<ImageSprite> {
    constructor(options?: ContainerOptions<ImageSprite> & {
        anchor: PointData | number
    }, textureAliases: string[] = []) {
        super(options)
        if (textureAliases) {
            textureAliases.forEach(textureAlias => {
                this.addChild(new ImageSprite(undefined, textureAlias))
            })
        }
        if (options?.anchor) {
            this.anchor = options.anchor
        }
    }
    override get memory() {
        let memory = super.memory
        memory.pixivnId = CANVAS_IMAGE_CONTAINER_ID
        return memory
    }
    override set memory(value) {
        super.memory = value
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
        return Promise.all(list)
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

    /**
     * The anchor sets the origin point of the imageContainer. The default value is taken from the {@link Texture}
     * and passed to the constructor.
     *
     * The default is `(0,0)`, this means the imageContainer's origin is the top left.
     *
     * Setting the anchor to `(0.5,0.5)` means the imageContainer's origin is centered.
     *
     * Setting the anchor to `(1,1)` would mean the imageContainer's origin point will be the bottom right corner.
     *
     * If you pass only single parameter, it will set both x and y to the same value as shown in the example below.
     * @example
     * import { ImageContainer } from '@drincs/pixi-vn';
     *
     * const imageContainer = new ImageContainer();
     * imageContainer.anchor = 0.5;
     */
    get anchor(): PointData {
        let x = this.pivot.x / this.width
        let y = this.pivot.y / this.height
        return { x, y }
    }
    set anchor(value: PointData | number) {
        if (typeof value === "number") {
            this.pivot.set(value * this.width, value * this.height)
        } else {
            this.pivot.set(value.x * this.width, value.y * this.height)
        }
    }
}
