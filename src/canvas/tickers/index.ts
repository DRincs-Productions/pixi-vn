export { default as TickerBase } from "./classes/TickerBase";
export type { default as TickerValue } from "./classes/TickerValue";
export { default as RegisteredTickers, tickerDecorator } from "./decorators/RegisteredTickers";
export { animate, timeline } from "./functions/motion";
export type { default as Ticker } from "./interfaces/Ticker";
export type { default as TickerArgs } from "./interfaces/TickerArgs";
export type { TickerHistory, default as TickerInfo } from "./interfaces/TickerInfo";
export type {
    TickerProgrationExponential,
    TickerProgrationLinear,
    default as TickerProgrationType,
} from "./interfaces/TickerProgrationType";
export type { default as TickersSequence } from "./interfaces/TickersSequence";
export type { default as TickerTimeoutHistory } from "./interfaces/TickerTimeoutHistory";
export type { CommonTickerProps } from "./types/CommonTickerProps";
