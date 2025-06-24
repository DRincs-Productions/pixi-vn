import {
    ContainerOptions,
    EventEmitter,
    SpriteOptions as PixiSpriteOptions,
    TextOptions as PixiTextOptions,
} from "pixi.js";
import CanvasEvent from "../classes/CanvasEvent";
import { AdditionalPositionsExtensionProps } from "../components/AdditionalPositions";
import { AnchorExtensionProps } from "../components/AnchorExtension";
import CanvasEventNamesType from "../types/CanvasEventNamesType";
import ContainerChild from "../types/ContainerChild";

export interface SpriteOptions extends Omit<PixiSpriteOptions, "on"> {
    /**
     * on() does not keep in memory the event class, use onEvent() instead
     * @deprecated
     */
    on?: <T extends EventEmitter.EventNames<string | symbol>>(
        event: T,
        fn: EventEmitter.EventListener<string | symbol, T>,
        context?: any
    ) => this;
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
    onEvent?: <T extends typeof CanvasEvent<this>>(event: CanvasEventNamesType, eventClass: T) => this;
}
export interface TextOptions extends Omit<PixiTextOptions, "on"> {
    /**
     * on() does not keep in memory the event class, use onEvent() instead
     * @deprecated
     */
    on?: <T extends EventEmitter.EventNames<string | symbol>>(
        event: T,
        fn: EventEmitter.EventListener<string | symbol, T>,
        context?: any
    ) => this;
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
    onEvent?: <T extends typeof CanvasEvent<this>>(event: CanvasEventNamesType, eventClass: T) => this;
}
export interface ImageContainerOptions<C extends ContainerChild = ContainerChild>
    extends ContainerOptions<C>,
        AnchorExtensionProps,
        AdditionalPositionsExtensionProps {}
export interface ImageSpriteOptions extends SpriteOptions, AdditionalPositionsExtensionProps {}
export interface VideoSpriteOptions extends ImageSpriteOptions {
    loop?: boolean;
    paused?: boolean;
    currentTime?: number;
}
