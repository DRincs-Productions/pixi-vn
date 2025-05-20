import { GameStepState } from "@drincs/pixi-vn";
import { CachedMap } from "../classes";
import { HistoryStep } from "../narration";
import { createExportableElement } from "../utils";

export default class HistoryManagerStatic {
    static _diffHistory = new CachedMap<number, HistoryStep["diff"]>({ cacheSize: 5 });
    static _stepsHistory = new CachedMap<number, Omit<HistoryStep, "diff">>({ cacheSize: 10 });
    static stepLimitSaved: number = 20;
    /**
     * goBackRunning is a boolean that indicates if the go back is running.
     */
    static goBackRunning: boolean = false;
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
