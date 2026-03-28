import type { Texture } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { CANVAS_IMAGE_CONTAINER_ID } from "../../constants";
import { logger } from "../../utils/log-utility";
import { default as RegisteredCanvasComponents, setMemoryContainer } from "../decorators/canvas-element-decorator";
import { checkIfVideo } from "../functions/canvas-utility";
import { ImageContainerOptions } from "../interfaces/canvas-options";
import ImageContainerMemory from "../interfaces/memory/ImageContainerMemory";
import { analizePositionsExtensionProps } from "./AdditionalPositionsExtension";
import Container from "./Container";
import ImageSprite from "./ImageSprite";
import VideoSprite from "./VideoSprite";

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
        options = analizePositionsExtensionProps(options as any);
        let align = undefined;
        let percentagePosition = undefined;
        let anchor = undefined;
        if (options && "anchor" in options && options?.anchor !== undefined) {
            anchor = options.anchor;
            delete options.anchor;
        }
        if (options && "align" in options && options?.align !== undefined) {
            align = options.align;
            delete options.align;
        }
        if (options && "percentagePosition" in options && options?.percentagePosition !== undefined) {
            percentagePosition = options.percentagePosition;
            delete options.percentagePosition;
        }
        super(options);
        options = analizePositionsExtensionProps(options);
        if (textureAliases) {
            textureAliases.forEach((textureAlias) => {
                let component;
                if (checkIfVideo(textureAlias)) {
                    component = new VideoSprite(undefined, textureAlias);
                } else {
                    component = new ImageSprite(undefined, textureAlias);
                }
                this.addChild(component);
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
        let promises: Promise<void>[] = Array<Promise<void>>(this.children.length);
        for (let i = 0; i < this.children.length; i++) {
            promises[i] = this.children[i].load();
        }
        // wait for all promises
        return Promise.all(promises)
            .then(() => {
                this._loadIsStarted = false;
                this.reloadAnchor();
                this.reloadPosition();
            })
            .catch((e) => {
                this._loadIsStarted = false;
                logger.error("Error into ImageContainer.load()");
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

export async function setMemoryImageContainer(element: ImageContainer, memory: ImageContainerOptions | {}) {
    memory = analizePositionsExtensionProps(memory)!;
    setMemoryContainer(element, memory, {
        end: async () => {
            if ("loadIsStarted" in memory && memory.loadIsStarted) {
                await element.load();
            }
        },
    });
}
