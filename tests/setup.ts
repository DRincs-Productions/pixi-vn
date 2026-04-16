// Polyfill minimal WebAudio API for Node/jsdom environment used by Vitest
if (typeof (globalThis as any).AudioBuffer === "undefined") {
    class _AudioBuffer {
        length = 0;
        duration = 0;
        sampleRate = 44100;
        numberOfChannels = 1;
        constructor() {}
    }
    (globalThis as any).AudioBuffer = _AudioBuffer;
}

if (typeof (globalThis as any).AudioContext === "undefined") {
    class _AudioContext {
        sampleRate = 44100;
        constructor() {}
        decodeAudioData(_buffer: ArrayBuffer) {
            // simple stub
            return Promise.resolve(new (globalThis as any).AudioBuffer());
        }
        createBufferSource() {
            return { connect: () => {}, start: () => {}, stop: () => {} };
        }
        createGain() {
            return { connect: () => {}, gain: { value: 1 } };
        }
    }
    (globalThis as any).AudioContext = _AudioContext;
}

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
            labelIndex: NarrationManagerStatic.currentLabelStepIndex() || 0,
            openedLabels: narration.openedLabels,
        };
    },
    restoreGameStepState: async (state, navigate) => {
        HistoryManagerStatic._originalStepData = state;
        NarrationManagerStatic.setOpenedLabels(state.openedLabels);
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
