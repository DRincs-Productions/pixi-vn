import {
    GameUnifier,
    HistoryManagerStatic,
    narration,
    NarrationManagerStatic,
    RegisteredCharacters,
    sound,
    stepHistory,
    StepLabelResultType,
    storage,
    StorageManagerStatic,
} from "../src";
import { getGamePath } from "../src/utils/path-utility";

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
    processNavigationRequests: (navigationRequestsCount: number) => {
        let newValue = navigationRequestsCount;
        let result: Promise<void | StepLabelResultType> = Promise.resolve();
        if (navigationRequestsCount > 0) {
            newValue--;
            result = narration.continue({});
        } else if (navigationRequestsCount < 0) {
            newValue = 0;
            result = stepHistory.back({}, { steps: navigationRequestsCount * -1 });
        }
        return { newValue, result };
    },
    // storage
    getVariable: (key) => storage.get(key),
    setVariable: (key, value) => storage.set(key, value),
    removeVariable: (key) => storage.remove(key),
    getFlag: (key) => storage.getFlag(key),
    setFlag: (name, value) => storage.setFlag(name, value),
    onLabelClosing: (openedLabelsNumber) => StorageManagerStatic.clearOldTempVariables(openedLabelsNumber),
});

GameUnifier.onError = async (type, error, props) => {
    await GameUnifier.restoreGameStepState(HistoryManagerStatic.originalStepData, GameUnifier.navigate);
};
