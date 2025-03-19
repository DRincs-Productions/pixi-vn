import { GameStepState } from "@drincs/pixi-vn";
import { test } from "vitest";
import {
    createExportableElement,
    GameUnifier,
    narration,
    NarrationManagerStatic,
    sound,
    storage,
    StorageManagerStatic,
} from "../src";
import { logger } from "../src/utils/log-utility";
import { getGamePath } from "../src/utils/path-utility";

test("setup", async () => {
    GameUnifier.initialize({
        getCurrentGameStepState: () => {
            return {
                path: getGamePath(),
                storage: GameUnifier.exportStorageData(),
                canvas: GameUnifier.exportCanvasData(),
                sound: GameUnifier.exportSoundData(),
                labelIndex: NarrationManagerStatic.currentLabelStepIndex || 0,
                openedLabels: GameUnifier.getOpenedLabels(),
            };
        },
        ignoreAddChangeHistory: (originalState: GameStepState, newState: GameStepState) => {
            if (originalState.openedLabels.length === newState.openedLabels.length) {
                try {
                    let lastStepDataOpenedLabelsString = JSON.stringify(originalState.openedLabels);
                    let historyStepOpenedLabelsString = JSON.stringify(newState.openedLabels);
                    if (
                        lastStepDataOpenedLabelsString === historyStepOpenedLabelsString &&
                        originalState.path === newState.path &&
                        originalState.labelIndex === newState.labelIndex
                    ) {
                        return true;
                    }
                } catch (e) {
                    logger.error("Error comparing opened labels", e);
                    return true;
                }
            }
            return false;
        },
        restoreGameStepState: async (state, navigate) => {
            NarrationManagerStatic._originalStepData = state;
            NarrationManagerStatic._openedLabels = state.openedLabels;
            await GameUnifier.importStorageData(state.storage);
            await GameUnifier.importCanvasData(state.canvas);
            await GameUnifier.importSoundData(state.sound);
            navigate(state.path);
        },
        // narration
        getStepCounter: () => narration.stepCounter,
    });
    // storage
    GameUnifier.exportStorageData = () => storage.export();
    GameUnifier.importStorageData = (data) => storage.import(data);
    GameUnifier.getVariable = (key) => storage.getVariable(key);
    GameUnifier.setVariable = (key, value) => storage.setVariable(key, value);
    GameUnifier.removeVariable = (key) => storage.removeVariable(key);
    GameUnifier.getFlag = (key) => storage.getFlag(key);
    GameUnifier.setFlag = (name, value) => storage.setFlag(name, value);
    GameUnifier.clearOldTempVariables = (openedLabelsNumber) =>
        StorageManagerStatic.clearOldTempVariables(openedLabelsNumber);
    // sound
    GameUnifier.exportSoundData = () => sound.export();
    GameUnifier.importSoundData = (data) => sound.import(data);
    // narration
    GameUnifier.getOpenedLabels = () => createExportableElement(narration.openedLabels);
    GameUnifier.exportNarrationData = narration.export;
    GameUnifier.importNarrationData = narration.import;

    // canvas
    GameUnifier.importCanvasData = async () => {};
    GameUnifier.forceCompletionOfTicker = () => {};
    GameUnifier.exportCanvasData = () => {
        return {} as any;
    };
});
