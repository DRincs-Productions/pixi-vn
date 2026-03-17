import AudioChannel from "./classes/AudioChannel";
import Sound from "./classes/Sound";
import IMediaInstance from "./interfaces/IMediaInstance";
import { SoundPlay } from "./interfaces/SoundGameState";
import { SoundPlayOptions } from "./interfaces/SoundOptions";

export default class SoundManagerStatic {
    private constructor() {}
    static soundAliasesOrder: string[] = [];
    static soundsPlaying: { [key: string]: SoundPlay } = {};
    static sounds: { [key: string]: Sound } = {};
    static readonly mediaInstances: {
        [key: string]: {
            channelAlias: string;
            instance: IMediaInstance;
            options: SoundPlayOptions;
        };
    } = {};
    static channels: { [alias: string]: AudioChannel } = {};
}
