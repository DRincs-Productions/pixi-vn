import type {
    ContainerChild,
    ContainerEvents,
    EventEmitter,
    SpriteOptions as PixiSpriteOptions,
    Texture,
    TextureSourceLike,
} from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { CANVAS_SPRITE_ID } from "../../constants";
import { logger } from "../../utils/log-utility";
import CanvasBaseItem from "../classes/CanvasBaseItem";
import CanvasEvent from "../classes/CanvasEvent";
import { default as RegisteredCanvasComponents } from "../decorators/canvas-element-decorator";
import RegisteredEvents from "../decorators/event-decorator";
import { getMemorySprite } from "../functions/canvas-memory-utility";
import { getTexture } from "../functions/texture-utility";
import AssetMemory from "../interfaces/AssetMemory";
import { SpriteOptions } from "../interfaces/canvas-options";
import CanvasBaseItemMemory from "../interfaces/memory/CanvasBaseItemMemory";
import SpriteMemory, { SpriteBaseMemory } from "../interfaces/memory/SpriteMemory";
import CanvasEventNamesType from "../types/CanvasEventNamesType";
import { EventIdType } from "../types/EventIdType";
import { setMemoryContainer } from "./Container";

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
    set memory(_value: Memory | SpriteMemory) {}
    private _onEvents: { [name: string]: EventIdType } = {};
    get onEvents() {
        return this._onEvents;
    }
    /**
     * is same function as on(), but it keeps in memory the children.
     * @param event The event type, e.g., 'click', 'mousedown', 'mouseup', 'pointerdown', etc.
     * @param eventClass The class that extends CanvasEvent.
     * @returns
     * @example
     * ```typescript
     * \@eventDecorator()
     * export class EventTest extends CanvasEvent<Sprite> {
     *     override fn(event: CanvasEventNamesType, sprite: Sprite): void {
     *         if (event === 'pointerdown') {
     *             sprite.scale.x *= 1.25;
     *             sprite.scale.y *= 1.25;
     *         }
     *     }
     * }
     * ```
     *
     * ```typescript
     * let sprite = addImage("alien", 'https://pixijs.com/assets/eggHead.png')
     * await sprite.load()
     *
     * sprite.eventMode = 'static';
     * sprite.cursor = 'pointer';
     * sprite.onEvent('pointerdown', EventTest);
     *
     * canvas.add("bunny", sprite);
     * ```
     */
    onEvent<T extends typeof CanvasEvent<typeof this>>(event: CanvasEventNamesType, eventClass: T) {
        let id = eventClass.prototype.id;
        let instance = RegisteredEvents.getInstance(id);
        this._onEvents[event] = id;
        if (instance) {
            super.on(event, () => {
                (instance as CanvasEvent<CanvasBaseItem<any>>).fn(event, this);
            });
            if (!this.interactive) {
                this.interactive = true;
                this.eventMode = "dynamic";
            }
        } else {
            logger.error(`Event ${id} not found`);
        }
        return this;
    }
    /**
     * Add a listener for a given event.
     * Unlike {@link onEvent}, this method does **not track the event association in the current game state**, so it will not be included in saves.
     */
    override on<T extends keyof ContainerEvents<ContainerChild> | keyof { [K: symbol]: any; [K: {} & string]: any }>(
        event: T,
        fn: (
            ...args: EventEmitter.ArgumentMap<
                ContainerEvents<ContainerChild> & { [K: symbol]: any; [K: {} & string]: any }
            >[Extract<T, keyof ContainerEvents<ContainerChild> | keyof { [K: symbol]: any; [K: {} & string]: any }>]
        ) => void,
        context?: any,
    ): this {
        return super.on(event, fn, context);
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
    getInstance: async (type, memory) => {
        const instance = new type();
        instance.memory = memory;
        await setMemorySprite(instance, memory);
        return instance;
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
        if ("assetsData" in memory) {
            if (Array.isArray(memory.assetsData) && memory.assetsData.length > 0) {
                textureData = memory.assetsData[0];
            }
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
                element.onEvent(event as any, instance);
            }
        }
    }
}
