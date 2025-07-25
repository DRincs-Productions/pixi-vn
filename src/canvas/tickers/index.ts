export { default as TickerBase } from "./classes/TickerBase";
export type { default as TickerValue } from "./classes/TickerValue";
export { default as FadeAlphaTicker } from "./components/FadeAlphaTicker";
export { default as MoveTicker } from "./components/MoveTicker";
export { default as RotateTicker } from "./components/RotateTicker";
export { default as ZoomTicker } from "./components/ZoomTicker";
export { default as RegisteredTickers, tickerDecorator } from "./decorators/ticker-decorator";
export { default as animate } from "./functions/motion";
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
export type { FadeAlphaTickerProps } from "./types/FadeAlphaTickerProps";
export type { MoveTickerProps } from "./types/MoveTickerProps";
export type { RotateTickerProps } from "./types/RotateTickerProps";
export type { ZoomTickerProps } from "./types/ZoomTickerProps";
