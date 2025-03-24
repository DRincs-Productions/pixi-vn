import CanvasGamState from "../canvas/interfaces/CanvasGamState";
import ExportedStep from "../narration/interfaces/ExportedStep";
import ExportedSounds from "../sound/interfaces/ExportedSounds";
import { ExportedStorage } from "../storage";

export default interface GameState {
    pixivn_version: string;
    stepData: ExportedStep;
    storageData: ExportedStorage;
    canvasData: CanvasGamState;
    soundData: ExportedSounds;
    path: string;
}
