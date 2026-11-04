import type CanvasBaseItem from "@canvas/classes/CanvasBaseItem";
import type AdditionalPositionsExtension from "@canvas/components/AdditionalPositionsExtension";
import { analizePositionsExtensionProps } from "@canvas/components/AdditionalPositionsExtension";
import type ListenerExtension from "@canvas/components/ListenerExtension";
import { addListenerHandler, type OnEventsHandlers } from "@canvas/components/ListenerExtension";
import { setMemorySprite } from "@canvas/components/Sprite";
import { default as RegisteredCanvasComponents } from "@canvas/decorators/canvas-element-decorator";
import { getMemorySprite } from "@canvas/functions/canvas-memory-utility";
import { CanvasPropertyUtility as PropsUtils } from "@canvas/functions/canvas-property-utility";
import { getAnimatedSpriteFrames } from "@canvas/functions/spritesheet-utility";
import type { AnimatedSpriteSource } from "@canvas/interfaces/AnimatedSpriteSource";
import type { AnimatedSpriteOptions } from "@canvas/interfaces/canvas-options";
import type AnimatedSpriteMemory from "@canvas/interfaces/memory/AnimatedSpriteMemory";
import { CANVAS_ANIMATED_SPRITE_ID } from "@constants";
import { GameUnifier, PixiError } from "@drincs/pixi-vn/core";
import type {
    ContainerChild,
    ContainerEvents,
    EventEmitter,
    ObservablePoint,
    PointData,
    Texture,
    TextureSource,
} from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { logger } from "@utils/log-utility";

/**
 * This class is a extension of the [PIXI.AnimatedSprite class](https://pixijs.com/8.x/examples/sprite/animated-sprite-jet),
 * it has the same properties and methods, but it has the ability to be saved and loaded by the Pixi’VN library.
 *
 * The frames are described by an {@link AnimatedSpriteSource} (spritesheet alias, animation name, frame names), so they
 * can be saved and rebuilt on restore. You need to use {@link load} to load the frames.
 * This class is used for functions like {@link addAnimatedSprite} and {@link showAnimatedSprite}.
 *
 * The `onComplete`, `onFrameChange` and `onLoop` callbacks are not saved. For logic that must survive a save, use
 * `.on(...)` with a handler registered with `eventDecorator`.
 * @example
 * ```ts
 * const explosion = new AnimatedSprite(
 *     { anchor: 0.5, align: 0.5, animationSpeed: 0.5, autoPlay: true },
 *     { spritesheet: "https://pixijs.com/assets/spritesheet/mc.json" },
 * );
 * await explosion.load();
 * canvas.add("explosion", explosion);
 * ```
 * @example
 * ```ts
 * const fighter = addAnimatedSprite("fighter", "https://pixijs.com/assets/spritesheet/fighter.json", { loop: true });
 * await fighter.load();
 * fighter.play();
 * ```
 */
export default class AnimatedSprite
    extends PIXI.AnimatedSprite
    implements CanvasBaseItem<AnimatedSpriteMemory>, ListenerExtension, AdditionalPositionsExtension
{
    /**
     * @param options The options for the component.
     * @param source The description of the frames, used by {@link load}. If you have initialized the "asset matrix", you can use the aliases of the assets.
     */
    constructor(options?: AnimatedSpriteOptions, source?: AnimatedSpriteSource) {
        const { align, percentagePosition, ...restOptions } =
            analizePositionsExtensionProps(options) || {};
        super({
            ...restOptions,
            // PIXI.AnimatedSprite needs at least one frame: the real frames are set by `load()`
            textures: [PIXI.Texture.EMPTY],
        });
        this.pixivnId = this.constructor.prototype.pixivnId || CANVAS_ANIMATED_SPRITE_ID;
        if (source) {
            this._source = source;
        }
        if (align) {
            this.align = align;
        }
        if (percentagePosition) {
            this.percentagePosition = percentagePosition;
        }
    }
    readonly pixivnId: string = CANVAS_ANIMATED_SPRITE_ID;
    private _source?: AnimatedSpriteSource;
    /**
     * The description of the frames, used by {@link load} and saved in the memory.
     */
    get source(): AnimatedSpriteSource | undefined {
        return this._source;
    }
    set source(value: AnimatedSpriteSource | undefined) {
        this._source = value;
    }
    get memory(): AnimatedSpriteMemory {
        const { textureData: _textureData, ...spriteMemory } = getMemorySprite(this);
        return {
            ...spriteMemory,
            pixivnId: this.pixivnId,
            align: this._align,
            percentagePosition: this._percentagePosition,
            source: this._source ? structuredClone(this._source) : undefined,
            animationSpeed: this.animationSpeed,
            loop: this.loop,
            updateAnchor: this.updateAnchor,
            autoUpdate: this.autoUpdate,
            currentFrame: this._pendingFrame ?? this.currentFrame,
            playing: this.playing,
            loadIsStarted: this._loadIsStarted,
        };
    }
    async setMemory(value: AnimatedSpriteMemory): Promise<void> {
        await setMemoryAnimatedSprite(this, value);
        this.reloadPosition();
    }
    /**
     * Not supported: the frames of an {@link AnimatedSprite} must be described by an {@link AnimatedSpriteSource},
     * so they can be saved. Use `new AnimatedSprite(options, { frames })` and {@link load} instead.
     * @throws {PixiError} always.
     */
    static override fromFrames(_frames: string[]): AnimatedSprite {
        throw new PixiError(
            "invalid_usage",
            "AnimatedSprite.fromFrames is not supported: use new AnimatedSprite(options, { spritesheet, frames }) and load()",
        );
    }
    /**
     * Not supported: the frames of an {@link AnimatedSprite} must be described by an {@link AnimatedSpriteSource},
     * so they can be saved. Use `new AnimatedSprite(options, { frames })` and {@link load} instead.
     * @throws {PixiError} always.
     */
    static override fromImages(_images: string[]): AnimatedSprite {
        throw new PixiError(
            "invalid_usage",
            "AnimatedSprite.fromImages is not supported: use new AnimatedSprite(options, { frames }) and load()",
        );
    }

    private _loadIsStarted: boolean = false;
    get loadIsStarted() {
        return this._loadIsStarted;
    }
    /**
     * A frame index requested before the frames were loaded. It is applied by {@link load}.
     */
    private _pendingFrame?: number;
    /**
     * Load the frames described by {@link source} and set them as the textures of the component.
     * The current frame and the playing state set before the loading are kept.
     * @returns A promise that resolves when the frames are loaded.
     */
    async load() {
        if (!this._source) {
            logger.warn("AnimatedSprite.load(): no source to load");
            return;
        }
        this._loadIsStarted = true;
        try {
            const frames = await getAnimatedSpriteFrames(this._source);
            const wasPlaying = this.playing;
            const frame = this._pendingFrame ?? this.currentFrame;
            this._pendingFrame = undefined;
            this.textures = frames;
            const safeFrame = Math.min(Math.max(0, frame), this.totalFrames - 1);
            if (wasPlaying) {
                this.gotoAndPlay(safeFrame);
            } else {
                this.gotoAndStop(safeFrame);
            }
            this.reloadPosition();
        } catch (e) {
            logger.error("Error into AnimatedSprite.load()", e);
            const error = new PixiError(
                "unregistered_asset",
                `Error loading AnimatedSprite ${this._source.spritesheet ?? this._source.frames?.join(", ")}`,
                "canvas",
                { ...this.memory, label: this.label },
                this,
            );
            GameUnifier.runOnError(error, {});
        } finally {
            this._loadIsStarted = false;
        }
    }
    /**
     * Go to a frame. If the frames are not loaded yet, the frame is applied by {@link load}.
     * @param frameNumber The index of the frame.
     * @param play If `true`, the animation starts playing from that frame.
     */
    setFrame(frameNumber: number, play: boolean = this.playing) {
        if (this.haveEmptyTexture || frameNumber > this.totalFrames - 1) {
            this._pendingFrame = frameNumber;
            if (play) {
                this.play();
            } else {
                this.stop();
            }
            return;
        }
        this._pendingFrame = undefined;
        if (play) {
            this.gotoAndPlay(frameNumber);
        } else {
            this.gotoAndStop(frameNumber);
        }
    }
    /**
     * Check if the frames are not loaded yet.
     * @returns A boolean that is true if the component only has the empty placeholder frame.
     */
    get haveEmptyTexture() {
        return this.totalFrames <= 1 && this.texture === PIXI.Texture.EMPTY;
    }

    override set texture(value: Texture<TextureSource<any>>) {
        super.texture = value;
        this.reloadPosition();
    }
    override get texture(): Texture<TextureSource<any>> {
        return super.texture;
    }

    /** ListenerExtension */

    readonly onEventsHandlers: OnEventsHandlers = {};
    override on<
        T extends
            | keyof ContainerEvents<ContainerChild>
            | keyof { [K: symbol]: any; [K: {} & string]: any },
    >(
        event: T,
        fn: (
            ...args: [
                ...EventEmitter.ArgumentMap<
                    ContainerEvents<ContainerChild> & { [K: symbol]: any; [K: {} & string]: any }
                >[Extract<
                    T,
                    | keyof ContainerEvents<ContainerChild>
                    | keyof { [K: symbol]: any; [K: {} & string]: any }
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
        if (this._align === undefined) this._align = {};
        if (typeof value === "number") {
            this._align.x = value;
            this._align.y = value;
        } else {
            if (value.x !== undefined) this._align.x = value.x;
            if (value.y !== undefined) this._align.y = value.y;
        }
        this.reloadPosition();
    }
    get align() {
        const superPivot = PropsUtils.getSuperPoint(this.pivot, this.angle);
        const superScale = PropsUtils.getSuperPoint(this.scale, this.angle);
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
        if (this._align === undefined) this._align = {};
        this._align.x = value;
        this.reloadPosition();
    }
    get xAlign() {
        const superPivot = PropsUtils.getSuperPoint(this.pivot, this.angle);
        const superScale = PropsUtils.getSuperPoint(this.scale, this.angle);
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
        if (this._align === undefined) this._align = {};
        this._align.y = value;
        this.reloadPosition();
    }
    get yAlign() {
        const superPivot = PropsUtils.getSuperPoint(this.pivot, this.angle);
        const superScale = PropsUtils.getSuperPoint(this.scale, this.angle);
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
        if (this._percentagePosition === undefined) this._percentagePosition = {};
        if (typeof value === "number") {
            this._percentagePosition.x = value;
            this._percentagePosition.y = value;
        } else {
            if (value.x !== undefined) this._percentagePosition.x = value.x;
            if (value.y !== undefined) this._percentagePosition.y = value.y;
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
        if (this._percentagePosition === undefined) this._percentagePosition = {};
        this._percentagePosition.x = _value;
        this.reloadPosition();
    }
    get percentageY() {
        return PropsUtils.calculatePercentagePositionByPosition("height", this.y);
    }
    set percentageY(_value: number) {
        this._align = undefined;
        if (this._percentagePosition === undefined) this._percentagePosition = {};
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
            const superPivot = PropsUtils.getSuperPoint(this.pivot, this.angle);
            const superScale = PropsUtils.getSuperPoint(this.scale, this.angle);
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
                super.x = PropsUtils.calculatePositionByPercentagePosition(
                    "width",
                    this._percentagePosition.x,
                );
            }
            if (this._percentagePosition.y !== undefined) {
                super.y = PropsUtils.calculatePositionByPercentagePosition(
                    "height",
                    this._percentagePosition.y,
                );
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
RegisteredCanvasComponents.add<AnimatedSpriteMemory, typeof AnimatedSprite>(AnimatedSprite, {
    name: CANVAS_ANIMATED_SPRITE_ID,
    getInstance: async (type, memory) => {
        const instance = new type(undefined, memory.source);
        await instance.setMemory(memory);
        return instance;
    },
    copyProperty: async (component, source) => {
        await setMemoryAnimatedSprite(component as AnimatedSprite, source, { ignoreSource: true });
    },
});

export async function setMemoryAnimatedSprite(
    element: AnimatedSprite,
    memory: Partial<AnimatedSpriteMemory>,
    options?: {
        /**
         * If `true`, the `source` of the memory is ignored and the frames are not loaded.
         */
        ignoreSource?: boolean;
    },
) {
    const ignoreSource = options?.ignoreSource || false;
    if (!ignoreSource && "source" in memory && memory.source) {
        element.source = memory.source;
    }
    if ("animationSpeed" in memory && memory.animationSpeed !== undefined)
        element.animationSpeed = memory.animationSpeed;
    if ("loop" in memory && memory.loop !== undefined) element.loop = memory.loop;
    if ("updateAnchor" in memory && memory.updateAnchor !== undefined)
        element.updateAnchor = memory.updateAnchor;
    if ("autoUpdate" in memory && memory.autoUpdate !== undefined)
        element.autoUpdate = memory.autoUpdate;
    await setMemorySprite(element as any, memory, {
        // the textures come from the source, not from `textureData`
        ignoreTexture: true,
        half: async () => {
            if (!ignoreSource && element.source && (memory.loadIsStarted || memory.source)) {
                await element.load();
            }
        },
    });
    if (memory.currentFrame !== undefined || memory.playing !== undefined) {
        element.setFrame(
            memory.currentFrame ?? element.currentFrame,
            memory.playing ?? element.playing,
        );
    }
}
