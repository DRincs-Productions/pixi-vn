import { CanvasGamState } from "../canvas";
import { OpenedLabel } from "../narration";
import { SoundGameState } from "../sound";
import { ExportedStorage } from "../storage";

/**
 * It is a interface that contains the information of a step.
 */
export default interface GameStepStateData {
    /**
     * The browser path that occurred during the progression of the steps.
     */
    path: string;
    /**
     * The storage that occurred during the progression of the steps.
     */
    storage: ExportedStorage;
    /**
     * The index of the label that occurred during the progression of the steps.
     */
    labelIndex: number;
    /**
     * The canvas that occurred during the progression of the steps.
     */
    canvas: CanvasGamState;
    /**
     * The opened labels that occurred during the progression of the steps.
     */
    openedLabels: OpenedLabel[];
    /**
     * The sound data that occurred during the progression of the steps.
     */
    sound: SoundGameState;
}
