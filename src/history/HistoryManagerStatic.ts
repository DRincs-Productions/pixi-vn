import type { GameStepState } from "@drincs/pixi-vn";
import type { Difference } from "microdiff";
import { CachedMap } from "../classes";
import type { HistoryStep, NarrationHistory } from "../narration";
import { createExportableElement } from "../utils";

namespace HistoryManagerStatic {
    export const _diffHistory = new CachedMap<number, Difference[]>({
        cacheSize: 5,
    });
    export const _stepsInfoHistory = new CachedMap<number, Omit<HistoryStep, "diff">>({ cacheSize: 5 });
    export const _narrationHistory = new CachedMap<number, NarrationHistory>({ cacheSize: 50 });
    export let stepLimitSaved: number = 20;
    export let _originalStepData: GameStepState | undefined = undefined;
    export function getOriginalStepData(): GameStepState {
        if (!_originalStepData) {
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
        return createExportableElement(_originalStepData);
    }
    export function setOriginalStepData(value: GameStepState) {
        _originalStepData = createExportableElement(value);
    }
}
export default HistoryManagerStatic;
