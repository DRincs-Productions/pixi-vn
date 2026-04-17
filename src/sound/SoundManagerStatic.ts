import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type IMediaInstance from "@sound/interfaces/IMediaInstance";
import type { SoundPlayOptions } from "@sound/interfaces/SoundOptions";

namespace SoundManagerStatic {
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
    export const channels: { [alias: string]: AudioChannelInterface } = {};
    export const delayTimeoutInstances: [number | NodeJS.Timeout, string][] = [];
}
export default SoundManagerStatic;
