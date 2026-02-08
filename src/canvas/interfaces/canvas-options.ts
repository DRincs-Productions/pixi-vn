import type {
    CanvasTextOptions,
    ContainerOptions,
    EventEmitter,
    SpriteOptions as PixiSpriteOptions,
} from "@drincs/pixi-vn/pixi.js";
import { AdditionalPositionsExtensionProps } from "../components/AdditionalPositionsExtension";
import { AnchorExtensionProps } from "../components/AnchorExtension";
import ContainerChild from "../types/ContainerChild";

export interface SpriteOptions extends Omit<PixiSpriteOptions, "on"> {
    /**
     * Add a listener for a given event.
     * Unlike {@link onEvent}, this method does **not track the event association in the current game state**, so it will not be included in saves.
     */
    on?: <T extends EventEmitter.EventNames<string | symbol>>(
        event: T,
        fn: EventEmitter.EventListener<string | symbol, T>,
        context?: any,
    ) => this;
}
export interface TextOptions extends Omit<CanvasTextOptions, "on">, AdditionalPositionsExtensionProps {
    /**
     * Add a listener for a given event.
     * Unlike {@link onEvent}, this method does **not track the event association in the current game state**, so it will not be included in saves.
     */
    on?: <T extends EventEmitter.EventNames<string | symbol>>(
        event: T,
        fn: EventEmitter.EventListener<string | symbol, T>,
        context?: any,
    ) => this;
}
export interface ImageContainerOptions<C extends ContainerChild = ContainerChild>
    extends ContainerOptions<C>, AnchorExtensionProps, AdditionalPositionsExtensionProps {}
export interface ImageSpriteOptions extends SpriteOptions, AdditionalPositionsExtensionProps {}
export interface VideoSpriteOptions extends ImageSpriteOptions {
    loop?: boolean;
    paused?: boolean;
    currentTime?: number;
}
