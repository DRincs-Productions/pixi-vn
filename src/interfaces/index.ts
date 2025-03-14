export type { ImageContainerOptions, ImageSpriteOptions, VideoSpriteOptions } from "./canvas/canvas-options";
export type { ShakeEffectProps } from "./canvas/effect-props";
export type {
    CanvasBaseItemMemory,
    /**
     *  @deprecated use "import { CanvasBaseItemMemory } from '@drincs/pixi-vn';"
     */
    CanvasBaseItemMemory as CanvasBaseMemory,
    /**
     *  @deprecated use "import { ContainerMemory } from '@drincs/pixi-vn';"
     */
    ContainerMemory as CanvasContainerMemory,
    /**
     *  @deprecated use "import { ImageSpriteMemory } from '@drincs/pixi-vn';"
     */
    ImageSpriteMemory as CanvasImageMemory,
    /**
     *  @deprecated use "import { SpriteBaseMemory } from '@drincs/pixi-vn';"
     */
    SpriteBaseMemory as CanvasSpriteBaseMemory,
    /**
     *  @deprecated use "import { SpriteMemory } from '@drincs/pixi-vn';"
     */
    SpriteMemory as CanvasSpriteMemory,
    /**
     *  @deprecated use "import { TextMemory } from '@drincs/pixi-vn';"
     */
    TextMemory as CanvasTextMemory,
    /**
     *  @deprecated use "import { VideoSpriteMemory } from '@drincs/pixi-vn';"
     */
    VideoSpriteMemory as CanvasVideoMemory,
    ContainerMemory,
    ImageContainerMemory,
    ImageSpriteMemory,
    SpriteBaseMemory,
    SpriteMemory,
    TextMemory,
    VideoSpriteMemory,
} from "./canvas/memory";
export type { default as TextureMemory } from "./canvas/TextureMemory";
export type {
    MoveInOutProps,
    PushInOutProps,
    ShowWithDissolveTransitionProps,
    ShowWithFadeTransitionProps,
    ZoomInOutProps,
} from "./canvas/transition-props";
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
