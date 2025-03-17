import ExportedCanvas from "../canvas/interfaces/ExportedCanvas";
import ExportedStep from "../narration/interfaces/ExportedStep";
import ExportedSounds from "./export/ExportedSounds";
import ExportedStorage from "./export/ExportedStorage";

export default interface GameState {
    pixivn_version: string;
    stepData: ExportedStep;
    storageData: ExportedStorage;
    canvasData: ExportedCanvas;
    soundData: ExportedSounds;
    path: string;
}
