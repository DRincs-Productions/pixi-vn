import type AudioChannelInterface from "./interfaces/AudioChannelInterface";
import type IMediaInstance from "./interfaces/IMediaInstance";
import type { SoundPlayOptions } from "./interfaces/SoundOptions";

export default class SoundManagerStatic {
    private constructor() {}
    static mediaInstances: {
        [alias: string]: {
            channelAlias: string;
            soundAlias: string;
            instance: IMediaInstance;
            stepCounter: number;
            options: SoundPlayOptions;
        };
    } = {};
    static channels: { [alias: string]: AudioChannelInterface } = {};
    static delayTimeoutInstances: [number | NodeJS.Timeout, string][] = [];
}
