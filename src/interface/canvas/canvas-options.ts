import { ContainerOptions, SpriteOptions } from "pixi.js";
import { ContainerChild } from "../../classes";
import { AdditionalPositionsExtensionProps } from "../../classes/canvas/AdditionalPositions";
import { AnchorExtensionProps } from "../../classes/canvas/AnchorExtension";

export interface ImageContainerOptions<C extends ContainerChild = ContainerChild> extends ContainerOptions<C>, AnchorExtensionProps, AdditionalPositionsExtensionProps { }
export interface ImageSpriteOptions extends SpriteOptions, AdditionalPositionsExtensionProps { }
