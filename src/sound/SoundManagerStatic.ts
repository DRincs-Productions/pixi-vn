import AudioChannelInterface from "./interfaces/AudioChannelInterface";
import IMediaInstance from "./interfaces/IMediaInstance";
import { SoundPlayOptions } from "./interfaces/SoundOptions";

export const mediaInstances: Map<
    string,
    {
        channelAlias: string;
        soundAlias: string;
        instance: IMediaInstance;
        stepCounter: number;
        options: SoundPlayOptions;
    }
> = new Map();

export default class SoundManagerStatic {
    private constructor() {}
    static channels: { [alias: string]: AudioChannelInterface } = {};
    static delayTimeoutInstances: [number | NodeJS.Timeout, string][] = [];
}
