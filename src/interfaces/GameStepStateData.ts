import { CanvasGameState } from "../canvas";
import { OpenedLabel } from "../narration";
import { SoundGameState } from "../sound";
import { StorageGameState } from "../storage";

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
    storage: StorageGameState;
    /**
     * The index of the label that occurred during the progression of the steps.
     */
    labelIndex: number;
    /**
     * The canvas that occurred during the progression of the steps.
     */
    canvas: CanvasGameState;
    /**
     * The opened labels that occurred during the progression of the steps.
     */
    openedLabels: OpenedLabel[];
    /**
     * The sound data that occurred during the progression of the steps.
     */
    sound: SoundGameState;
}
