import type AudioChannelInterface from "./interfaces/AudioChannelInterface";
import type IMediaInstance from "./interfaces/IMediaInstance";
import type { SoundPlayOptions } from "./interfaces/SoundOptions";

namespace SoundManagerStatic {
    export const mediaInstances: {
        [alias: string]: {
            channelAlias: string;
            soundAlias: string;
            instance: IMediaInstance;
            stepCounter: number;
            options: SoundPlayOptions;
        };
    } = {};
    export const channels: { [alias: string]: AudioChannelInterface } = {};
    export const delayTimeoutInstances: [number | NodeJS.Timeout, string][] = [];
}
export default SoundManagerStatic;
