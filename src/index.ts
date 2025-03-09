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
export * from "./narration";
export * from "./sound";
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
import * as narrationUtils from "./narration";
import * as soundUtils from "./sound";
import * as storageUtils from "./storage";
import * as functions from "./utils";

const pixivn = {
    Assets,
    Rectangle,
    ...classes,
    canvasUtils,
    narrationUtils,
    soundUtils,
    CANVAS_APP_GAME_LAYER_ALIAS,
    filters,
    Pause,
    Repeat,
    SYSTEM_RESERVED_STORAGE_KEYS,
    PIXIVN_VERSION,
    ...decorators,
    ...functions,
    ...pixivninterface,
    canvas: canvasUtils.canvas,
    narration: narrationUtils.narration,
    sound: soundUtils.sound,
    storage: storageUtils.storage,
};
export default pixivn;
