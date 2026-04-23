import { sound, type SoundLibrary } from "@pixi/sound";
import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type IMediaInstance from "@sound/interfaces/IMediaInstance";
import type { SoundPlayOptions } from "@sound/interfaces/SoundOptions";

export default class SoundManagerStatic {
    private constructor() {}

    static get soundInstance(): SoundLibrary | undefined {
        return SoundManagerStatic._sound;
    }

    static get sound(): SoundLibrary {
        if (SoundManagerStatic._sound === undefined) {
            const win = globalThis.window as
                | (Window &
                      typeof globalThis & {
                          webkitAudioContext?: typeof AudioContext;
                      })
                | undefined;
            const audioContextConstructor = win?.AudioContext ?? win?.webkitAudioContext;
            const requiresWebAudioFallback = Boolean(
                audioContextConstructor &&
                    (typeof audioContextConstructor.prototype.createDynamicsCompressor !== "function" ||
                        typeof audioContextConstructor.prototype.createAnalyser !== "function"),
            );

            if (win && requiresWebAudioFallback) {
                const mutableWin = win as Window & {
                    AudioContext?: typeof AudioContext;
                    webkitAudioContext?: typeof AudioContext;
                };
                const originalAudioContext = mutableWin.AudioContext;
                const originalWebkitAudioContext = mutableWin.webkitAudioContext;
                mutableWin.AudioContext = undefined;
                mutableWin.webkitAudioContext = undefined;
                try {
                    SoundManagerStatic._sound = sound.init();
                } finally {
                    mutableWin.AudioContext = originalAudioContext;
                    mutableWin.webkitAudioContext = originalWebkitAudioContext;
                }
            } else {
                SoundManagerStatic._sound = sound.init();
            }
        }
        return SoundManagerStatic._sound;
    }

    static destroy(): void {
        SoundManagerStatic._sound?.close();
        SoundManagerStatic._sound = undefined;
    }

    private static _sound: SoundLibrary | undefined;
    static mediaInstances: Map<
        string,
        {
            channelAlias: string;
            soundAlias: string;
            instance: IMediaInstance;
            stepCounter: number;
            options: SoundPlayOptions;
        }
    > = new Map();
    static readonly channels: Map<string, AudioChannelInterface> = new Map();
    static delayTimeoutInstances: [number | NodeJS.Timeout, string][] = [];
}
