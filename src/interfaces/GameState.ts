import type { NarrationGameState } from "@drincs/pixi-vn/narration";
import type CanvasGameState from "../canvas/interfaces/CanvasGameState";
import type HistoryGameState from "../history/interfaces/HistoryGameState";
import type SoundGameState from "../sound/interfaces/SoundGameState";
import type { StorageGameState } from "../storage";

export default interface GameState {
    pixivn_version: string;
    stepData: NarrationGameState;
    storageData: StorageGameState;
    canvasData: CanvasGameState;
    soundData: SoundGameState;
    historyData: HistoryGameState;
    path: string;
}
