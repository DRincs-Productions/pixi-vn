import type { GameStepState } from "@drincs/pixi-vn";
import type { Difference } from "microdiff";
import { CachedMap } from "../classes";
import type { HistoryStep, NarrationHistory } from "../narration";

/**
 * How often a go-back-able checkpoint is recorded:
 * - `"step"` (default): every single narration step, matching visual-novel-style games
 *   where the player may want to undo one line/sprite change at a time.
 * - `"paragraph"`: only when a new paragraph starts (the number of opened labels
 *   changes), a choice is proposed, or an input is requested - matching book-style
 *   narrations where undoing mid-paragraph doesn't make sense to the player.
 */
export type HistoryGoBackModeType = "step" | "paragraph";

export default class HistoryManagerStatic {
    static _diffHistory = new CachedMap<number, Difference[]>({
        cacheSize: 5,
    });
    static _stepsInfoHistory = new CachedMap<number, Omit<HistoryStep, "diff">>({ cacheSize: 5 });
    static _narrationHistory = new CachedMap<number, NarrationHistory>({ cacheSize: 50 });
    static stepLimitSaved: number = 20;
    static goBackMode: HistoryGoBackModeType = "step";
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
