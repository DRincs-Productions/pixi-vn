import CachedMap from "@classes/CachedMap";
import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type MediaInteface from "@sound/interfaces/MediaInteface";
import type * as Tone from "tone";

export default class SoundManagerStatic {
    private constructor() {}
    static mediaInstances: Map<string, MediaInteface> = new Map();
    static readonly channels: Map<string, AudioChannelInterface> = new Map();
    static delayTimeoutInstances: [number | NodeJS.Timeout, string][] = [];
    /** Tone.js audio buffers keyed by sound alias. */
    static readonly bufferRegistry: CachedMap<string, Tone.ToneAudioBuffer> = new CachedMap({
        cacheSize: 10,
    });
}
