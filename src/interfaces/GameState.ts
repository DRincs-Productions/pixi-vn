import CanvasGamState from "../canvas/interfaces/CanvasGamState";
import NarrationGamState from "../narration/interfaces/NarrationGamState";
import ExportedSounds from "../sound/interfaces/ExportedSounds";
import { ExportedStorage } from "../storage";

export default interface GameState {
    pixivn_version: string;
    stepData: NarrationGamState;
    storageData: ExportedStorage;
    canvasData: CanvasGamState;
    soundData: ExportedSounds;
    path: string;
}
