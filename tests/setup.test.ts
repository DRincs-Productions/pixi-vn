import { test } from "vitest";
import {
    GameUnifier,
    HistoryManagerStatic,
    narration,
    NarrationManagerStatic,
    RegisteredCharacters,
    sound,
    stepHistory,
    storage,
    StorageManagerStatic,
} from "../src";
import { getGamePath } from "../src/utils/path-utility";

test("setup", async () => {
    GameUnifier.init({
        getCurrentGameStepState: () => {
            return {
                path: getGamePath(),
                storage: storage.export(),
                canvas: () => {
                    return {} as any;
                },
                sound: sound.export(),
                labelIndex: NarrationManagerStatic.currentLabelStepIndex || 0,
                openedLabels: narration.openedLabels,
            };
        },
        restoreGameStepState: async (state, navigate) => {
            HistoryManagerStatic._originalStepData = state;
            NarrationManagerStatic.openedLabels = state.openedLabels;
            storage.restore(state.storage);
            // await canvas.restore(state.canvas);
            sound.restore(state.sound);
            navigate(state.path);
        },
        // narration
        getStepCounter: () => narration.stepCounter,
        setStepCounter: (value) => {
            NarrationManagerStatic._stepCounter = value;
        },
        getOpenedLabels: () => narration.openedLabels.length,
        addHistoryItem: (historyInfo, options) => {
            return stepHistory.add(historyInfo, options);
        },
        getCurrentStepsRunningNumber: () => NarrationManagerStatic.stepsRunning,
        getCharacter: (id: string) => {
            return RegisteredCharacters.get(id);
        },
        // storage
        getVariable: (key) => storage.getVariable(key),
        setVariable: (key, value) => storage.setVariable(key, value),
        removeVariable: (key) => storage.removeVariable(key),
        getFlag: (key) => storage.getFlag(key),
        setFlag: (name, value) => storage.setFlag(name, value),
        onLabelClosing: (openedLabelsNumber) => StorageManagerStatic.clearOldTempVariables(openedLabelsNumber),
    });
});
