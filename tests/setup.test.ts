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

test("setup", async () => {
    GameUnifier.initialize({
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
    GameUnifier.getCurrentLabelStepIndex = () => NarrationManagerStatic.currentLabelStepIndex || 0;
    GameUnifier.exportNarrationData = narration.export;
    GameUnifier.importNarrationData = narration.import;

    // canvas
    GameUnifier.importCanvasData = async () => {};
    GameUnifier.forceCompletionOfTicker = () => {};
    GameUnifier.exportCanvasData = () => {
        return {} as any;
    };
});
