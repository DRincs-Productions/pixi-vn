import Container from "./Container";
import ImageSprite from "./ImageSprite";

export const CANVAS_CONTAINER_ID = "image-container"

/**
 * This class is a extension of the {@link Container}, it has the same properties and methods, 
 * but this container is composed only of {@link ImageSprite} and introduces the {@link ImageContainer.load} functionality
 * @example
 * ```typescript
 *  const container = new ImageContainer();
 *  canvas.add(container);
 *  for (let i = 0; i < 25; i++)
 *  {
 *      const bunny = new ImageSprite({}, 'https://pixijs.com/assets/bunny.png');
 *      bunny.x = (i % 5) * 40;
 *      bunny.y = Math.floor(i / 5) * 40;
 *      container.addChild(bunny);
 *  }
 *  await container.load()
 * ```
 */
export default class ImageContainer extends Container<ImageSprite> {
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
