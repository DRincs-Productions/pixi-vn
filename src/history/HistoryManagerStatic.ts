import { GameStepState } from "@drincs/pixi-vn";
import { HistoryStep } from "../narration";
import { createExportableElement } from "../utils";

export default class HistoryManagerStatic {
    static _stepsHistory: HistoryStep[] = [];
    static stepLimitSaved: number = 20;
    /**
     * goBackRunning is a boolean that indicates if the go back is running.
     */
    static goBackRunning: boolean = false;
    /**
     * lastHistoryStep is the last history step that occurred during the progression of the steps.
     */
    static get lastHistoryStep(): HistoryStep | null {
        if (HistoryManagerStatic._stepsHistory.length > 0) {
            return HistoryManagerStatic._stepsHistory[HistoryManagerStatic._stepsHistory.length - 1];
        }
        return null;
    }
    static _originalStepData: GameStepState | undefined = undefined;
    static get originalStepData(): GameStepState {
        if (!HistoryManagerStatic._originalStepData) {
            return {
                path: "",
                storage: {},
                canvas: {
                    elementAliasesOrder: [],
                    elements: {},
                    stage: {},
                    tickers: {},
                    tickersSteps: {},
                    tickersOnPause: {},
                    tickersToCompleteOnStepEnd: { tikersIds: [], stepAlias: [] },
                },
                sound: {
                    soundAliasesOrder: [],
                    soundsPlaying: {},
                    playInStepIndex: {},
                    filters: undefined,
                },
                labelIndex: -1,
                openedLabels: [],
            };
        }
        return createExportableElement(HistoryManagerStatic._originalStepData);
    }
    static set originalStepData(value: GameStepState) {
        HistoryManagerStatic._originalStepData = createExportableElement(value);
    }
}
