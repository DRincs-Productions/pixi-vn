import type OpenedLabel from "./OpenedLabel";

/**
 * Interface exported step data
 */
export default interface NarrationGameState {
    openedLabels: OpenedLabel[];
    stepCounter: number;
}
