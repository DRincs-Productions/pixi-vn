import type {
    ContainerChild,
    ContainerEvents,
    SpriteOptions as PixiSpriteOptions,
    Texture,
    TextureSourceLike,
} from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { CANVAS_SPRITE_ID } from "../../constants";
import { logger } from "../../utils/log-utility";
import CanvasBaseItem from "../classes/CanvasBaseItem";
import { default as RegisteredCanvasComponents, setMemoryContainer } from "../decorators/canvas-element-decorator";
import RegisteredEvents, { SERIALIZABLE_EVENT } from "../decorators/event-decorator";
import { getMemorySprite } from "../functions/canvas-memory-utility";
import { getTexture } from "../functions/texture-utility";
import AssetMemory from "../interfaces/AssetMemory";
import { SpriteOptions } from "../interfaces/canvas-options";
import CanvasBaseItemMemory from "../interfaces/memory/CanvasBaseItemMemory";
import SpriteMemory, { SpriteBaseMemory } from "../interfaces/memory/SpriteMemory";

/**
 * This class is a extension of the [PIXI.Sprite class](https://pixijs.com/8.x/examples/sprite/basic), it has the same properties and methods,
 * but it has the ability to be saved and loaded by the Pixi’VN library.
 * @example
 * ```typescript
 * const texture = await Assets.load('https://pixijs.com/assets/bunny.png');
 * const sprite = Sprite.from(texture);
 *
 * sprite.anchor.set(0.5);
 * sprite.x = canvas.screen.width / 2;
 * sprite.y = canvas.screen.height / 2;
 *
 * sprite.eventMode = 'static';
 * sprite.cursor = 'pointer';
 * sprite.onEvent('pointerdown', EventTest);
 *
 * canvas.add("bunny", sprite);
 * ```
 */
export default class Sprite<Memory extends PixiSpriteOptions & CanvasBaseItemMemory = SpriteMemory>
    extends PIXI.Sprite
    implements CanvasBaseItem<Memory | SpriteMemory>
{
    constructor(options?: SpriteOptions | Omit<Texture, "on">) {
        super(options);
        this.pixivnId = this.constructor.prototype.pixivnId || CANVAS_SPRITE_ID;
    }
    readonly pixivnId: string = CANVAS_SPRITE_ID;
    get memory(): Memory | SpriteMemory {
        return getMemorySprite(this);
    }
    async setMemory(value: Memory | SpriteMemory): Promise<void> {
        return await setMemorySprite(this, value);
    }
    private readonly onEventsHandlers: { [name: string]: string } = {};
    override on<T extends keyof ContainerEvents<ContainerChild> | keyof { [K: symbol]: any; [K: {} & string]: any }>(
        event: T,
        fn: (event: T, component: typeof this) => void,
        context?: any,
    ): this {
        const handlerId = (fn as any)[SERIALIZABLE_EVENT] as string;

        if (handlerId && typeof handlerId === "string") {
            this.onEventsHandlers[event as string] = handlerId;
        } else {
            logger.warn(
                `The event handler for event "${event as string}" is not registered with the eventDecorator, it will not be saved in the memory and it will not work after loading the game. Please register the event handler with the eventDecorator to avoid this warning. Read more about it here: https://pixi-vn.web.app/start/canvas-functions#add-a-listener-to-an-event`,
            );
        }

        return super.on<T>(event, (e) => fn(e as T, this), context);
    }
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean): Sprite<any> {
        let sprite = PIXI.Sprite.from(source, skipCache);
        let mySprite = new Sprite();
        mySprite.texture = sprite.texture;
        return mySprite;
    }
}
RegisteredCanvasComponents.add<SpriteMemory, typeof Sprite<SpriteMemory>>(Sprite, {
    name: CANVAS_SPRITE_ID,
    copyProperty: async (component, source) => {
        await setMemorySprite(component as Sprite, source, { ignoreTexture: true });
    },
});

export async function setMemorySprite<Memory extends SpriteBaseMemory>(
    element: Sprite<any>,
    memory: Memory | {},
    options?: {
        half?: () => Promise<void>;
        ignoreTexture?: boolean;
    },
) {
    let ignoreTexture = options?.ignoreTexture || false;
    await setMemoryContainer(element, memory);
    if (!ignoreTexture) {
        if ("textureImage" in memory && memory.textureImage && memory.textureImage.image) {
            let texture = await getTexture(memory.textureImage.image);
            if (texture) {
                element.texture = texture;
            }
        }
        let textureData: AssetMemory | undefined = undefined;
        if ("textureData" in memory && memory.textureData) {
            textureData = memory.textureData;
        }
        if (textureData) {
            if (textureData.url !== "EMPTY") {
                let textureUrl: string = textureData.url;
                if (textureData.alias && PIXI.Assets.resolver.hasKey(textureData.alias)) {
                    textureUrl = textureData.alias;
                }
                let texture = await getTexture(textureUrl);
                if (texture) {
                    element.texture = texture;
                }
            }
        }
    }
    let half = options?.half;
    if (half) {
        await half();
    } else {
        if ("anchor" in memory && memory.anchor !== undefined) {
            if (typeof memory.anchor === "number") {
                element.anchor.set(memory.anchor, memory.anchor);
            } else {
                element.anchor.set(memory.anchor.x, memory.anchor.y);
            }
        }
    }
    "roundPixels" in memory && memory.roundPixels !== undefined && (element.roundPixels = memory.roundPixels);
    if ("onEvents" in memory) {
        for (let event in memory.onEvents) {
            let id = memory.onEvents[event];
            let instance = RegisteredEvents.get(id);
            if (instance) {
                element.on(event, instance as (event: any, component: typeof element) => void);
            }
        }
    }
}
