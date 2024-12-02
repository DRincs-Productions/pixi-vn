import { ContainerOptions } from "pixi.js";
import Container from "./Container";
import ImageSprite from "./ImageSprite";

export const CANVAS_CONTAINER_ID = "image-container"

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
    constructor(options?: ContainerOptions<ImageSprite>, imageLinks: string[] = []) {
        super(options)
        if (imageLinks) {
            imageLinks.forEach(imageLink => {
                this.addChild(new ImageSprite(undefined, imageLink))
            })
        }
    }
    override get memory() {
        let memory = super.memory
        memory.pixivnId = CANVAS_CONTAINER_ID
        return memory
    }
    pixivnId: string = CANVAS_CONTAINER_ID
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
}
