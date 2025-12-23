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
        navigate: (path: string) => window.history.pushState({}, "test", path),
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
        getCharacter: (id: string) => {
            return RegisteredCharacters.get(id);
        },
        // storage
        getVariable: (key) => storage.get(key),
        setVariable: (key, value) => storage.set(key, value),
        removeVariable: (key) => storage.removeVariable(key),
        getFlag: (key) => storage.getFlag(key),
        setFlag: (name, value) => storage.setFlag(name, value),
        onLabelClosing: (openedLabelsNumber) => StorageManagerStatic.clearOldTempVariables(openedLabelsNumber),
    });
});
