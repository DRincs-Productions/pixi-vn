import CachedMap from "@classes/CachedMap";
import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type MediaInteface from "@sound/interfaces/MediaInteface";
import type { SoundPlayOptions } from "@sound/interfaces/SoundOptions";
import type * as Tone from "tone";

export default class SoundManagerStatic {
    private constructor() {}
    static mediaInstances: Map<
        string,
        {
            channelAlias: string;
            soundAlias: string;
            instance: MediaInteface;
            stepCounter: number;
            options: SoundPlayOptions;
        }
    > = new Map();
    static readonly channels: Map<string, AudioChannelInterface> = new Map();
    static delayTimeoutInstances: [number | NodeJS.Timeout, string][] = [];
    /** Tone.js audio buffers keyed by sound alias. */
    static readonly bufferRegistry: CachedMap<string, Tone.ToneAudioBuffer> = new CachedMap({
        cacheSize: 10,
    });
}
