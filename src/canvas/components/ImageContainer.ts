import { analizePositionsExtensionProps } from "@canvas/components/AdditionalPositionsExtension";
import Container from "@canvas/components/Container";
import ImageSprite from "@canvas/components/ImageSprite";
import VideoSprite from "@canvas/components/VideoSprite";
import RegisteredCanvasComponents, {
    setMemoryContainer,
} from "@canvas/decorators/canvas-element-decorator";
import { checkIfVideo } from "@canvas/functions/canvas-utility";
import type { ImageContainerOptions } from "@canvas/interfaces/canvas-options";
import type ImageContainerMemory from "@canvas/interfaces/memory/ImageContainerMemory";
import { CANVAS_IMAGE_CONTAINER_ID } from "@constants";
import type { Texture } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { logger } from "@utils/log-utility";

/**
 * This class is a extension of the {@link Container}, it has the same properties and methods,
 * but this container is composed only of {@link ImageSprite} and introduces the {@link load} functionality
 * @example
 * ```typescript
 *  const liamBodyImageUrl = 'https://example.com/assets/liam/body.png';
 *  const liamHeadImageUrl = 'https://example.com/assets/liam/head.png';
 *  const container = new ImageContainer(undefined, [liamBodyImageUrl, liamHeadImageUrl]);
 *  await container.load()
 *  canvas.add(container);
 * ```
 */
export default class ImageContainer extends Container<ImageSprite, ImageContainerMemory> {
    constructor(options?: ImageContainerOptions<ImageSprite>, textureAliases: string[] = []) {
        const { anchor, align, percentagePosition, ...restOptions } =
            analizePositionsExtensionProps(options) || {};
        super(restOptions);
        if (textureAliases) {
            textureAliases.forEach((textureAlias) => {
                if (checkIfVideo(textureAlias)) {
                    this.addChild(new VideoSprite(undefined, textureAlias));
                } else {
                    this.addChild(new ImageSprite(undefined, textureAlias));
                }
            });
        }
        if (anchor) {
            this.anchor = anchor;
        }
        if (align) {
            this.align = align;
        }
        if (percentagePosition) {
            this.percentagePosition = percentagePosition;
        }
    }
    override get memory(): ImageContainerMemory {
        return {
            ...super.memory,
            pixivnId: CANVAS_IMAGE_CONTAINER_ID,
            loadIsStarted: this._loadIsStarted,
        };
    }
    override async setMemory(value: ImageContainerMemory): Promise<void> {
        await this.importChildren(value);
        await setMemoryImageContainer(this, value);
        this.reloadAnchor();
        this.reloadPosition();
    }
    readonly pixivnId: string = CANVAS_IMAGE_CONTAINER_ID;
    private _loadIsStarted: boolean = false;
    get loadIsStarted() {
        return this._loadIsStarted;
    }
    /**
     * Load the children images.
     * @returns A promise that resolves when the images are loaded.
     */
    async load() {
        this._loadIsStarted = true;
        const promises = this.children.map((child) => child.load());
        // wait for all promises
        return Promise.all(promises)
            .then(() => {
                this._loadIsStarted = false;
                this.reloadAnchor();
                this.reloadPosition();
            })
            .catch((e) => {
                this._loadIsStarted = false;
                logger.error("Error into ImageContainer.load()", e);
            });
    }

    /**
     * The texture of the first child.
     * If there is no child, it returns a new {@link Texture}.
     */
    get texture() {
        if (this.children.length > 0) {
            return this.children[0].texture;
        }
        return new PIXI.Texture();
    }

    /**
     * Check if there is a child with the empty texture.
     * @returns A boolean that is true if there is a child with the empty texture.
     */
    get haveEmptyTexture() {
        return this.children.some((child) => child.texture._source.label === "EMPTY");
    }
}
RegisteredCanvasComponents.add<ImageContainerMemory, typeof ImageContainer>(ImageContainer, {
    name: CANVAS_IMAGE_CONTAINER_ID,
    copyProperty: async (component, memory) => {
        return await setMemoryImageContainer(component as ImageContainer, memory);
    },
});

export async function setMemoryImageContainer(
    element: ImageContainer,
    memory: ImageContainerOptions | {},
) {
    memory = analizePositionsExtensionProps(memory)!;
    setMemoryContainer(element, memory, {
        end: async () => {
            if ("loadIsStarted" in memory && memory.loadIsStarted) {
                await element.load();
            }
        },
    });
}
