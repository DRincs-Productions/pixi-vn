import {
    ContainerOptions,
    EventEmitter,
    SpriteOptions as PixiSpriteOptions,
    TextOptions as PixiTextOptions,
} from "pixi.js";
import { AdditionalPositionsExtensionProps } from "../components/AdditionalPositions";
import { AnchorExtensionProps } from "../components/AnchorExtension";
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
