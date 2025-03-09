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
export * from "./interface";
export { default as SoundManagerStatic } from "./managers/SoundManagerStatic";
export { default as StorageManagerStatic } from "./managers/StorageManagerStatic";
export * from "./narration";
export { default as NarrationManagerStatic } from "./narration/NarrationManagerStatic";
export * from "./types";
export * from "./types/ticker";
export * from "./utils";

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
import * as pixivninterface from "./interface";
import SoundManager from "./managers/SoundManager";
import StorageManager from "./managers/StorageManager";
import * as narrationUtils from "./narration";
import * as functions from "./utils";

const sound = new SoundManager(narration);
const storage: pixivninterface.StorageManagerInterface = new StorageManager(narration);

export { narration, sound, storage };

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
    narration: narrationUtils.narration,
    sound,
    storage,
    canvas: canvasUtils.canvas,
};
export default pixivn;
