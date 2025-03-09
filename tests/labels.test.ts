import { expect, test } from "vitest";
import {
    createExportableElement,
    HistoryStepData,
    NarrationManagerInterface,
    NarrationManagerStatic,
    newLabel,
    sound,
    storage,
} from "../src";
import NarrationManager from "../src/narration/NarrationManager";
import { getGamePath } from "../src/utils/path-utility";

const getCurrentStepData: () => HistoryStepData = () => {
    let currentStepData: HistoryStepData = {
        path: getGamePath(),
        storage: storage.export(),
        canvas: {} as any,
        sound: sound.removeOldSoundAndExport(),
        labelIndex: NarrationManagerStatic.currentLabelStepIndex || 0,
        openedLabels: createExportableElement(NarrationManagerStatic._openedLabels),
    };
    return currentStepData;
};

const restoreFromHistoryStep: (
    restoredStep: HistoryStepData,
    navigate: (path: string) => void
) => Promise<void> = async (restoredStep: HistoryStepData, navigate: (path: string) => void) => {
    NarrationManagerStatic._originalStepData = restoredStep;
    NarrationManagerStatic._openedLabels = createExportableElement(restoredStep.openedLabels);
    storage.import(createExportableElement(restoredStep.storage));
    sound.import(createExportableElement(restoredStep.sound), NarrationManagerStatic._lastStepIndex - 1);
    navigate(restoredStep.path);
};

const forceCompletionOfTicker = () => {};

const narration: NarrationManagerInterface = new NarrationManager(
    getCurrentStepData,
    restoreFromHistoryStep,
    forceCompletionOfTicker
);

const pathLabel = newLabel("path", [
    () => {
        narration.dialogue = "This is a test label";
        window.history.pushState({}, "int", "/int");
    },
    () => {
        narration.dialogue = "This is a test label 2";
        window.history.pushState({}, "test", "/test");
    },
    () => {
        narration.dialogue = "This is a test label 3";
    },
]);

test("path test", async () => {
    await narration.callLabel(pathLabel, {});
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
        oltherParams: {},
    });
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
        oltherParams: {},
    });
    await narration.goNext({});
    expect(narration.dialogue).toEqual({
        text: "This is a test label 3",
        oltherParams: {},
    });
    expect(getGamePath()).toBe("/test");
    await narration.goBack((path) => window.history.pushState({}, "test", path));
    expect(narration.dialogue).toEqual({
        text: "This is a test label 2",
        oltherParams: {},
    });
    expect(getGamePath()).toBe("/test");
    await narration.goBack((path) => window.history.pushState({}, "test", path));
    expect(narration.dialogue).toEqual({
        text: "This is a test label",
        oltherParams: {},
    });
    expect(getGamePath()).toBe("/int");
});
