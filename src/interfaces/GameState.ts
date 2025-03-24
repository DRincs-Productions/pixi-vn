import CanvasGamState from "../canvas/interfaces/CanvasGamState";
import NarrationGameState from "../narration/interfaces/NarrationGameState";
import SoundGameState from "../sound/interfaces/SoundGameState";
import { ExportedStorage } from "../storage";

export default interface GameState {
    pixivn_version: string;
    stepData: NarrationGameState;
    storageData: ExportedStorage;
    canvasData: CanvasGamState;
    soundData: SoundGameState;
    path: string;
}
