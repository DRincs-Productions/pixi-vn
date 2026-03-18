import AudioChannel from "./classes/AudioChannel";
import IMediaInstance from "./interfaces/IMediaInstance";
import { SoundPlayOptions } from "./interfaces/SoundOptions";

export default class SoundManagerStatic {
    private constructor() {}
    static mediaInstances: {
        [key: string]: {
            channelAlias: string;
            soundAlias: string;
            instance: IMediaInstance;
            options: SoundPlayOptions;
        };
    } = {};
    static channels: { [alias: string]: AudioChannel } = {};
}
