import CanvasGameState from "../canvas/interfaces/CanvasGameState";
import NarrationGameState from "../narration/interfaces/NarrationGameState";
import SoundGameState from "../sound/interfaces/SoundGameState";
import { ExportedStorage } from "../storage";

export default interface GameState {
    pixivn_version: string;
    stepData: NarrationGameState;
    storageData: ExportedStorage;
    canvasData: CanvasGameState;
    soundData: SoundGameState;
    path: string;
}
