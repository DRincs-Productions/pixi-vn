export type { default as ExportedCanvas } from "./export/ExportedCanvas";
export type { ExportedSound, default as ExportedSounds } from "./export/ExportedSounds";
export type { default as ExportedStep } from "./export/ExportedStep";
export type { default as ExportedStorage } from "./export/ExportedStorage";
export type {
    default as GameState,
    /**
     *  @deprecated use "import { GameState } from '@drincs/pixi-vn';"
     */
    default as SaveData,
} from "./GameState";
export type { default as HistoryStep, HistoryStepData } from "./HistoryStep";
export type { default as LabelProps } from "./LabelProps";
export type { default as NarrationManagerInterface } from "./managers/NarrationManagerInterface";
export type { default as StorageManagerInterface } from "./managers/StorageManagerInterface";
export type { default as NarrativeHistory } from "./NarrativeHistory";
export type { default as OpenedLabel } from "./OpenedLabel";
export type { default as SoundOptions, SoundPlayOptions } from "./SoundOptions";
export type { default as StepLabelProps } from "./StepLabelProps";
export type { default as StepLabelResult } from "./StepLabelResult";
export type { default as Ticker } from "./Ticker";
export type { default as TickerArgs } from "./TickerArgs";
export type { default as TickerHistory, TickerHistoryForExport } from "./TickerHistory";
export type {
    TickerProgrationExponential,
    TickerProgrationLinear,
    default as TickerProgrationType,
} from "./TickerProgrationType";
export type { default as TickersSequence } from "./TickersSequence";
export type { default as TickerTimeoutHistory } from "./TickerTimeoutHistory";
