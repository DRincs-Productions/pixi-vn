import CanvasGameState from "../canvas/interfaces/CanvasGameState";
import NarrationGameState from "../narration/interfaces/NarrationGameState";
import SoundGameState from "../sound/interfaces/SoundGameState";
import { StorageGameState } from "../storage";

export default interface GameState {
    pixivn_version: string;
    stepData: NarrationGameState;
    storageData: StorageGameState;
    canvasData: CanvasGameState;
    soundData: SoundGameState;
    path: string;
}
