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
export * from "./classes";
export * from "./classes/ticker";
export { CANVAS_APP_GAME_LAYER_ALIAS, filters, Pause, Repeat } from "./constants";
export * from "./decorators";
export * from "./functions";
export * from "./interface";
export * from "./labels";
export * from "./managers";
export * from "./types";
export * from "./types/ticker";

import { Assets, Rectangle } from "pixi.js";
import * as classes from "./classes";
import * as classesTicker from "./classes/ticker";
import { CANVAS_APP_GAME_LAYER_ALIAS, filters, Pause, Repeat } from "./constants";
import * as decorators from "./decorators";
import * as functions from "./functions";
import * as pixivninterface from "./interface";
import * as labels from "./labels";
import * as managers from "./managers";

const pixivn = {
    Assets,
    Rectangle,
    ...classes,
    ...classesTicker,
    CANVAS_APP_GAME_LAYER_ALIAS,
    filters,
    Pause,
    Repeat,
    ...decorators,
    ...functions,
    ...pixivninterface,
    ...labels,
    ...managers,
};
export default pixivn;
