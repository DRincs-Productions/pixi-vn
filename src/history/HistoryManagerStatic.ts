import type { GameStepState } from "@drincs/pixi-vn";
import type { Difference } from "microdiff";
import { CachedMap } from "../classes";
import type { HistoryStep, NarrationHistory } from "../narration";

export default class HistoryManagerStatic {
    static _diffHistory = new CachedMap<number, Difference[]>({
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
                },
                labelIndex: -1,
                openedLabels: [],
            };
        }
        // canvas.export()/storage.export()/sound.export()/narration.openedLabels already
        // each run their own createExportableElement() internally, so by the time a value
        // reaches here (see index.ts's getCurrentGameStepState) it's already a clean, alias-free
        // clone - re-cloning the whole composite object again would be a redundant full-tree
        // JSON round trip on every single step.
        return HistoryManagerStatic._originalStepData;
    }
    static set originalStepData(value: GameStepState) {
        HistoryManagerStatic._originalStepData = value;
    }
}
