import type { Texture, TextureSource, TextureSourceLike } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { SpriteMemory } from "..";
import { CANVAS_IMAGE_ID } from "../../constants";
import { logger } from "../../utils/log-utility";
import { default as RegisteredCanvasComponents } from "../decorators/canvas-element-decorator";
import { showWithDissolve } from "../functions/canvas-transition";
import { addImage } from "../functions/image-utility";
import { getTexture } from "../functions/texture-utility";
import AssetMemory from "../interfaces/AssetMemory";
import { ImageSpriteOptions } from "../interfaces/canvas-options";
import ImageSpriteMemory from "../interfaces/memory/ImageSpriteMemory";
import Sprite, { setMemorySprite } from "./Sprite";

/**
 * This class is a extension of the {@link Sprite} class, it has the same properties and methods,
 * but it has some features that make texture management easier.
 * You need to use {@link load} to show the image in the canvas.
 * This class is used for functions like {@link addImage} and {@link showWithDissolve}.
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
export default class ImageSprite<Memory extends ImageSpriteMemory = ImageSpriteMemory> extends Sprite<Memory> {
    private _textureAlias?: string;
    protected get textureAlias() {
        if (this._textureAlias) {
            return this._textureAlias;
        }
        return this.texture.source.label;
    }
    readonly pixivnId: string = CANVAS_IMAGE_ID;
    constructor(options?: ImageSpriteOptions | Omit<Texture, "on"> | undefined, textureAlias?: string) {
        super(options);
        if (textureAlias) {
            this._textureAlias = textureAlias;
        }
    }
    override get memory(): ImageSpriteMemory {
        return {
            ...super.memory,
            pixivnId: this.pixivnId,
            loadIsStarted: this._loadIsStarted,
        };
    }
    override async setMemory(memory: Memory | SpriteMemory): Promise<void> {
        let textureData: AssetMemory | undefined = undefined;
        if ("textureData" in memory && memory.textureData) {
            textureData = memory.textureData;
        }
        if ("assetsData" in memory) {
            if (Array.isArray(memory.assetsData) && memory.assetsData.length > 0) {
                textureData = memory.assetsData[0];
            }
        }
        if (textureData) {
            if (textureData.alias) {
                this._textureAlias = textureData.alias;
            }
        }
        await setMemoryImageSprite(this, memory);
        this.reloadPosition();
    }
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean) {
        let sprite = PIXI.Sprite.from(source, skipCache);
        let mySprite = new ImageSprite();
        mySprite.texture = sprite.texture;
        return mySprite;
    }
    private _loadIsStarted: boolean = false;
    get loadIsStarted() {
        return this._loadIsStarted;
    }
    /**
     * Load the image from the link and set the texture of the sprite.
     * @returns A promise that resolves when the image is loaded.
     */
    async load() {
        this._loadIsStarted = true;
        return getTexture(this.textureAlias)
            .then((texture) => {
                this._loadIsStarted = false;
                if (texture) {
                    this.texture = texture;
                }
            })
            .catch((e) => {
                this._loadIsStarted = false;
                logger.error("Error into ImageSprite.load()", e);
            });
    }

    override set texture(value: Texture<TextureSource<any>>) {
        super.texture = value;
        this.reloadPosition();
    }
    override get texture(): Texture<TextureSource<any>> {
        return super.texture;
    }

    /**
     * Check if the texture is empty.
     * @returns A boolean that is true if the texture is empty.
     */
    get haveEmptyTexture() {
        return this.texture._source.label === "EMPTY";
    }
}
RegisteredCanvasComponents.add<ImageSpriteMemory, typeof ImageSprite>(ImageSprite, {
    name: CANVAS_IMAGE_ID,
    copyProperty: async (component, source) => {
        await setMemoryImageSprite(component as ImageSprite, source, { ignoreTexture: true });
    },
});

export async function setMemoryImageSprite(
    element: ImageSprite,
    memory: ImageSpriteMemory | {},
    options?: {
        ignoreTexture?: boolean;
    },
) {
    return await setMemorySprite(element, memory, {
        half: async () => {
            if ("loadIsStarted" in memory && memory.loadIsStarted) {
                await element.load();
            }
        },
        ignoreTexture: options?.ignoreTexture,
    });
}
