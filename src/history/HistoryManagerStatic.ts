import { HistoryStep } from "../narration";

export default class HistoryManagerStatic {
    static _stepsHistory: HistoryStep[] = [];
    /**
     * lastHistoryStep is the last history step that occurred during the progression of the steps.
     */
    static get lastHistoryStep(): HistoryStep | null {
        if (HistoryManagerStatic._stepsHistory.length > 0) {
            return HistoryManagerStatic._stepsHistory[HistoryManagerStatic._stepsHistory.length - 1];
        }
        return null;
    }
}
