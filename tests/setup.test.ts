import { test } from "vitest";
import { GameUnifier, narration, NarrationManagerStatic, sound, storage, StorageManagerStatic } from "../src";
import { getGamePath } from "../src/utils/path-utility";

test("setup", async () => {
    GameUnifier.initialize({
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
            NarrationManagerStatic._originalStepData = state;
            NarrationManagerStatic._openedLabels = state.openedLabels;
            storage.restore(state.storage);
            // await canvas.restore(state.canvas);
            sound.restore(state.sound);
            navigate(state.path);
        },
        // narration
        getStepCounter: () => narration.stepCounter,
        getOpenedLabels: () => narration.openedLabels.length,
        // storage
        getVariable: (key) => storage.getVariable(key),
        setVariable: (key, value) => storage.setVariable(key, value),
        removeVariable: (key) => storage.removeVariable(key),
        getFlag: (key) => storage.getFlag(key),
        setFlag: (name, value) => storage.setFlag(name, value),
        onLabelClosing: (openedLabelsNumber) => StorageManagerStatic.clearOldTempVariables(openedLabelsNumber),
    });
});
