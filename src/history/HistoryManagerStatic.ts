import { GameStepState } from "@drincs/pixi-vn";
import deepDiff from "deep-diff";
import { Difference } from "microdiff";
import { CachedMap } from "../classes";
import { HistoryStep, NarrationHistory } from "../narration";
import { createExportableElement } from "../utils";

export default class HistoryManagerStatic {
    static _diffHistory = new CachedMap<number, deepDiff.Diff<GameStepState, GameStepState>[] | Difference[]>({
        cacheSize: 5,
    });
    static _stepsInfoHistory = new CachedMap<number, Omit<HistoryStep, "diff">>({ cacheSize: 5 });
    static _narrationHistory = new CachedMap<number, NarrationHistory>({ cacheSize: 50 });
    static stepLimitSaved: number = 20;
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
