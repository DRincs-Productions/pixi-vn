import CanvasGamState from "../canvas/interfaces/CanvasGamState";
import NarrationGamState from "../narration/interfaces/NarrationGamState";
import SoundGameState from "../sound/interfaces/SoundGameState";
import { ExportedStorage } from "../storage";

export default interface GameState {
    pixivn_version: string;
    stepData: NarrationGamState;
    storageData: ExportedStorage;
    canvasData: CanvasGamState;
    soundData: SoundGameState;
    path: string;
}
