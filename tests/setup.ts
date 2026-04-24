// Web Audio API polyfills are defined in tests/webaudio-setup.ts which is
// listed before this file in vitest.config.ts setupFiles.  That file has no
// static imports so its body executes before Tone.js is loaded, ensuring
// window.AudioContext is defined when Tone.js evaluates hasAudioContext.

import { motion } from "@drincs/pixi-vn/motion";
// Avoid real network/file loading in tests: stub PIXI.Assets.load to a no-op
import PIXI from "@drincs/pixi-vn/pixi.js";
import {
    GameUnifier,
    HistoryManagerStatic,
    narration,
    NarrationManagerStatic,
    RegisteredCharacters,
    sound,
    stepHistory,
    type StepLabelPropsType,
    type StepLabelResultType,
    storage,
    StorageManagerStatic,
} from "../src";
import { getGamePath } from "../src/utils/path-utility";
try {
    if (!PIXI.Assets || typeof PIXI.Assets.load !== "function") {
        (PIXI as any).Assets = (PIXI as any).Assets || {};
        (PIXI as any).Assets.load = async (_: any) => {
            return {} as any;
        };
    } else {
        (PIXI as any).Assets.load = async (_: any) => {
            return {} as any;
        };
    }
} catch (e) {
    // best-effort stub; tests can proceed without real asset loading
}

// Stub Tone.js audio loading so that tests running in jsdom do not attempt
// real network requests.  SoundManager.load() creates ToneAudioBuffer instances;
// the stub registers a no-op buffer that resolves immediately on error.
// Note: runtime mocking of the sealed Tone.js ESM namespace is not possible
// here; actual isolation is handled in sound.test.ts via vi.mock("tone").
// This block exists only to document the intent.


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
        await sound.restore(state.sound);
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
    processNavigationRequests: (
        navigationRequestsCount: number,
        props: StepLabelPropsType<any>,
    ) => {
        let newValue = navigationRequestsCount;
        let result: Promise<void | StepLabelResultType> = Promise.resolve();
        if (navigationRequestsCount > 0) {
            newValue--;
            result = narration.continue(props);
        } else if (navigationRequestsCount < 0) {
            newValue = 0;
            result = stepHistory.back(props, { steps: navigationRequestsCount * -1 });
        }
        return { newValue, result };
    },
    // storage
    getVariable: (prefix, key) => StorageManagerStatic.getVariable(prefix, key),
    setVariable: (prefix, key, value) => StorageManagerStatic.setVariable(prefix, key, value),
    removeVariable: (prefix, key) => StorageManagerStatic.removeVariable(prefix, key),
    getFlag: (key) => storage.getFlag(key),
    setFlag: (name, value) => storage.setFlag(name, value),
    onLabelClosing: (openedLabelsNumber) =>
        StorageManagerStatic.clearOldTempVariables(openedLabelsNumber),
    // animations
    animate: (target, animationProps, options, priority) => {
        motion.animate(target, animationProps, options, priority);
    },
});
