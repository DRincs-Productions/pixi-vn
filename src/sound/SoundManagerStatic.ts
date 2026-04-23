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
            SoundManagerStatic._sound = sound.init()
        }
        return SoundManagerStatic._sound;
    }

    static destroy(): void {
        SoundManagerStatic._sound?.close();
        SoundManagerStatic._sound = undefined;
    }

    private static _sound: SoundLibrary | undefined = undefined;
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
