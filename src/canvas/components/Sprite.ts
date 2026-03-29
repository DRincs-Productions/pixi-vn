import { GameUnifier, PixiError } from "@drincs/pixi-vn/core";
import type {
    ContainerChild,
    ContainerEvents,
    EventEmitter,
    ObservablePoint,
    SpriteOptions as PixiSpriteOptions,
    PointData,
    Texture,
    TextureSourceLike,
} from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { CANVAS_SPRITE_ID } from "../../constants";
import { logger } from "../../utils/log-utility";
import CanvasBaseItem from "../classes/CanvasBaseItem";
import { default as RegisteredCanvasComponents, setMemoryContainer } from "../decorators/canvas-element-decorator";
import { getMemorySprite } from "../functions/canvas-memory-utility";
import { CanvasPropertyUtility as PropsUtils } from "../functions/canvas-property-utility";
import { getTexture } from "../functions/texture-utility";
import AssetMemory from "../interfaces/AssetMemory";
import { SpriteOptions } from "../interfaces/canvas-options";
import CanvasBaseItemMemory from "../interfaces/memory/CanvasBaseItemMemory";
import SpriteMemory, { SpriteBaseMemory } from "../interfaces/memory/SpriteMemory";
import AdditionalPositionsExtension, { analizePositionsExtensionProps } from "./AdditionalPositionsExtension";
import ListenerExtension, { addListenerHandler, OnEventsHandlers } from "./ListenerExtension";

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
    implements CanvasBaseItem<Memory | SpriteMemory>, ListenerExtension, AdditionalPositionsExtension
{
    constructor(options?: SpriteOptions | Omit<Texture, "on">) {
        options = analizePositionsExtensionProps(options as any);
        let align = undefined;
        let percentagePosition = undefined;
        if (options && "align" in options && options?.align !== undefined) {
            align = options.align;
            delete options.align;
        }
        if (options && "percentagePosition" in options && options?.percentagePosition !== undefined) {
            percentagePosition = options.percentagePosition;
            delete options.percentagePosition;
        }
        super(options);
        this.pixivnId = this.constructor.prototype.pixivnId || CANVAS_SPRITE_ID;
        if (align) {
            this.align = align;
        }
        if (percentagePosition) {
            this.percentagePosition = percentagePosition;
        }
    }
    readonly pixivnId: string = CANVAS_SPRITE_ID;
    get memory(): Memory | SpriteMemory {
        return {
            ...getMemorySprite(this),
            pixivnId: this.pixivnId,
            align: this._align,
            percentagePosition: this._percentagePosition,
        };
    }
    async setMemory(value: Memory | SpriteMemory): Promise<void> {
        return await setMemorySprite(this, value);
    }
    static override from(source: Texture | TextureSourceLike, skipCache?: boolean): Sprite<any> {
        let sprite = PIXI.Sprite.from(source, skipCache);
        let mySprite = new Sprite();
        mySprite.texture = sprite.texture;
        return mySprite;
    }

    /** ListenerExtension */

    readonly onEventsHandlers: OnEventsHandlers = {};
    override on<T extends keyof ContainerEvents<ContainerChild> | keyof { [K: symbol]: any; [K: {} & string]: any }>(
        event: T,
        fn: (
            ...args: [
                ...EventEmitter.ArgumentMap<
                    ContainerEvents<ContainerChild> & { [K: symbol]: any; [K: {} & string]: any }
                >[Extract<
                    T,
                    keyof ContainerEvents<ContainerChild> | keyof { [K: symbol]: any; [K: {} & string]: any }
                >],
                typeof this,
            ]
        ) => void,
        context?: any,
    ): this {
        addListenerHandler(event, this, fn);

        return super.on<T>(event, (...e) => fn(...e, this), context);
    }

    /** AdditionalPositionsExtension */

    private _align: Partial<PointData> | undefined = undefined;
    set align(value: Partial<PointData> | number) {
        this._percentagePosition = undefined;
        this._align === undefined && (this._align = {});
        if (typeof value === "number") {
            this._align.x = value;
            this._align.y = value;
        } else {
            value.x !== undefined && (this._align.x = value.x);
            value.y !== undefined && (this._align.y = value.y);
        }
        this.reloadPosition();
    }
    get align() {
        let superPivot = PropsUtils.getSuperPoint(this.pivot, this.angle);
        let superScale = PropsUtils.getSuperPoint(this.scale, this.angle);
        return {
            x: PropsUtils.calculateAlignByPosition(
                "width",
                this.x,
                PropsUtils.getSuperWidth(this),
                superPivot.x,
                superScale.x < 0,
                this.anchor.x,
            ),
            y: PropsUtils.calculateAlignByPosition(
                "height",
                this.y,
                PropsUtils.getSuperHeight(this),
                superPivot.y,
                superScale.y < 0,
                this.anchor.y,
            ),
        };
    }
    set xAlign(value: number) {
        this._percentagePosition = undefined;
        this._align === undefined && (this._align = {});
        this._align.x = value;
        this.reloadPosition();
    }
    get xAlign() {
        let superPivot = PropsUtils.getSuperPoint(this.pivot, this.angle);
        let superScale = PropsUtils.getSuperPoint(this.scale, this.angle);
        return PropsUtils.calculateAlignByPosition(
            "width",
            this.x,
            PropsUtils.getSuperWidth(this),
            superPivot.x,
            superScale.x < 0,
            this.anchor.x,
        );
    }
    set yAlign(value: number) {
        this._percentagePosition = undefined;
        this._align === undefined && (this._align = {});
        this._align.y = value;
        this.reloadPosition();
    }
    get yAlign() {
        let superPivot = PropsUtils.getSuperPoint(this.pivot, this.angle);
        let superScale = PropsUtils.getSuperPoint(this.scale, this.angle);
        return PropsUtils.calculateAlignByPosition(
            "height",
            this.y,
            PropsUtils.getSuperHeight(this),
            superPivot.y,
            superScale.y < 0,
            this.anchor.y,
        );
    }
    private _percentagePosition: Partial<PointData> | undefined = undefined;
    set percentagePosition(value: Partial<PointData> | number) {
        this._align = undefined;
        this._percentagePosition === undefined && (this._percentagePosition = {});
        if (typeof value === "number") {
            this._percentagePosition.x = value;
            this._percentagePosition.y = value;
        } else {
            value.x !== undefined && (this._percentagePosition.x = value.x);
            value.y !== undefined && (this._percentagePosition.y = value.y);
        }
        this.reloadPosition();
    }
    get percentagePosition() {
        return {
            x: PropsUtils.calculatePercentagePositionByPosition("width", this.x),
            y: PropsUtils.calculatePercentagePositionByPosition("height", this.y),
        };
    }
    get percentageX() {
        return PropsUtils.calculatePercentagePositionByPosition("width", this.x);
    }
    set percentageX(_value: number) {
        this._align = undefined;
        this._percentagePosition === undefined && (this._percentagePosition = {});
        this._percentagePosition.x = _value;
        this.reloadPosition();
    }
    get percentageY() {
        return PropsUtils.calculatePercentagePositionByPosition("height", this.y);
    }
    set percentageY(_value: number) {
        this._align = undefined;
        this._percentagePosition === undefined && (this._percentagePosition = {});
        this._percentagePosition.y = _value;
        this.reloadPosition();
    }
    get positionType(): "pixel" | "percentage" | "align" {
        if (this._align) {
            return "align";
        } else if (this._percentagePosition) {
            return "percentage";
        }
        return "pixel";
    }
    get positionInfo(): { x: number; y: number; type: "pixel" | "percentage" | "align" } {
        switch (this.positionType) {
            case "align":
                return { x: this.xAlign, y: this.yAlign, type: "align" };
            case "percentage":
                return { x: this.percentageX, y: this.percentageY, type: "percentage" };
            default:
                return { x: this.x, y: this.y, type: "pixel" };
        }
    }
    set positionInfo(value: { x: number; y: number; type?: "pixel" | "percentage" | "align" }) {
        if (value.type === "align") {
            this.align = { x: value.x, y: value.y };
        } else if (value.type === "percentage") {
            this.percentagePosition = { x: value.x, y: value.y };
        } else {
            this.position.set(value.x, value.y);
        }
    }
    protected reloadPosition() {
        if (this._align) {
            let superPivot = PropsUtils.getSuperPoint(this.pivot, this.angle);
            let superScale = PropsUtils.getSuperPoint(this.scale, this.angle);
            if (this._align.x !== undefined) {
                super.x = PropsUtils.calculatePositionByAlign(
                    "width",
                    this._align.x,
                    PropsUtils.getSuperWidth(this),
                    superPivot.x,
                    superScale.x < 0,
                    this.anchor.x,
                );
            }
            if (this._align.y !== undefined) {
                super.y = PropsUtils.calculatePositionByAlign(
                    "height",
                    this._align.y,
                    PropsUtils.getSuperHeight(this),
                    superPivot.y,
                    superScale.y < 0,
                    this.anchor.y,
                );
            }
        } else if (this._percentagePosition) {
            if (this._percentagePosition.x !== undefined) {
                super.x = PropsUtils.calculatePositionByPercentagePosition("width", this._percentagePosition.x);
            }
            if (this._percentagePosition.y !== undefined) {
                super.y = PropsUtils.calculatePositionByPercentagePosition("height", this._percentagePosition.y);
            }
        }
    }
    get position(): ObservablePoint {
        return super.position;
    }
    set position(value: ObservablePoint) {
        this._align = undefined;
        this._percentagePosition = undefined;
        super.position = value;
    }
    get x(): number {
        return super.x;
    }
    set x(value: number) {
        this._align = undefined;
        this._percentagePosition = undefined;
        super.x = value;
    }
    override get y(): number {
        return super.y;
    }
    override set y(value: number) {
        this._align = undefined;
        this._percentagePosition = undefined;
        super.y = value;
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
    memory = analizePositionsExtensionProps(memory)!;
    let ignoreTexture = options?.ignoreTexture || false;
    await setMemoryContainer(element, memory);
    if (!ignoreTexture) {
        if ("textureImage" in memory && memory.textureImage && memory.textureImage.image) {
            try {
                let texture = await getTexture(memory.textureImage.image);
                if (texture) {
                    element.texture = texture;
                }
            } catch (e) {
                logger.error("Error in Sprite.setMemorySprite() while loading texture");
                e = new PixiError(
                    "unregistered_asset",
                    `Error loading image ${memory.textureImage.image}`,
                    "canvas",
                    memory as any,
                );
                GameUnifier.runOnError(e, {});
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
                try {
                    let texture = await getTexture(textureUrl);
                    if (texture) {
                        element.texture = texture;
                    }
                } catch (e) {
                    logger.error("Error in Sprite.setMemorySprite() while loading texture");
                    e = new PixiError(
                        "unregistered_asset",
                        `Error loading image ${textureUrl}`,
                        "canvas",
                        memory as any,
                    );
                    GameUnifier.runOnError(e, {});
                }
            }
        }
    }
    let half = options?.half;
    if (half) {
        await half();
    }
    if ("anchor" in memory && memory.anchor !== undefined) {
        if (typeof memory.anchor === "number") {
            element.anchor.set(memory.anchor, memory.anchor);
        } else {
            element.anchor.set(memory.anchor.x, memory.anchor.y);
        }
    }
    "align" in memory && memory.align !== undefined && (element.align = memory.align);
    "percentagePosition" in memory &&
        memory.percentagePosition !== undefined &&
        (element.percentagePosition = memory.percentagePosition);
    "roundPixels" in memory && memory.roundPixels !== undefined && (element.roundPixels = memory.roundPixels);
}
