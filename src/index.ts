export { Assets, Rectangle } from "pixi.js";
export type {
    ContainerOptions,
    SpriteOptions,
    TextOptions,
    Texture,
    TextureSourceLike,
    Ticker as TickerValue,
    UPDATE_PRIORITY,
} from "pixi.js";
export * from "./canvas";
export { default as CanvasManagerStatic } from "./canvas/CanvasManagerStatic";
export * from "./classes";
export {
    CANVAS_APP_GAME_LAYER_ALIAS,
    filters,
    Pause,
    PIXIVN_VERSION,
    Repeat,
    SYSTEM_RESERVED_STORAGE_KEYS,
} from "./constants";
export * from "./decorators";
export * from "./functions";
export * from "./interface";
export * from "./managers";
export { default as NarrationManagerStatic } from "./managers/NarrationManagerStatic";
export { default as SoundManagerStatic } from "./managers/SoundManagerStatic";
export { default as StorageManagerStatic } from "./managers/StorageManagerStatic";
export * from "./types";
export * from "./types/ticker";

import { Assets, Rectangle } from "pixi.js";
import * as canvasUtils from "./canvas";
import * as classes from "./classes";
import {
    CANVAS_APP_GAME_LAYER_ALIAS,
    filters,
    Pause,
    PIXIVN_VERSION,
    Repeat,
    SYSTEM_RESERVED_STORAGE_KEYS,
} from "./constants";
import * as decorators from "./decorators";
import * as functions from "./functions";
import * as pixivninterface from "./interface";
import * as managers from "./managers";

const pixivn = {
    Assets,
    Rectangle,
    ...classes,
    canvasUtils,
    CANVAS_APP_GAME_LAYER_ALIAS,
    filters,
    Pause,
    Repeat,
    SYSTEM_RESERVED_STORAGE_KEYS,
    PIXIVN_VERSION,
    ...decorators,
    ...functions,
    ...pixivninterface,
    ...managers,
};
export default pixivn;
