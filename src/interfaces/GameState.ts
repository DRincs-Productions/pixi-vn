import ExportedCanvas from "../canvas/interfaces/ExportedCanvas";
import ExportedStep from "../narration/interfaces/ExportedStep";
import ExportedSounds from "../sound/interfaces/ExportedSounds";
import { ExportedStorage } from "../storage";

export default interface GameState {
    pixivn_version: string;
    stepData: ExportedStep;
    storageData: ExportedStorage;
    canvasData: ExportedCanvas;
    soundData: ExportedSounds;
    path: string;
}
