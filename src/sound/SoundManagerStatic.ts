import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type IMediaInstance from "@sound/interfaces/IMediaInstance";
import type { SoundPlayOptions } from "@sound/interfaces/SoundOptions";

export default class SoundManagerStatic {
    private constructor() {}
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
    static channels: { [alias: string]: AudioChannelInterface } = {};
    static delayTimeoutInstances: [number | NodeJS.Timeout, string][] = [];
}
