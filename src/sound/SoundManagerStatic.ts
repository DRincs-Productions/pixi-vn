import CachedMap from "@classes/CachedMap";
import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type MediaInteface from "@sound/interfaces/MediaInteface";
import { Gain, getDestination, type Player, type ToneAudioBuffer } from "tone";

export default class SoundManagerStatic {
    private constructor() {}
    static freezeBus = new Gain(1).toDestination();
    static liveBus = getDestination();
    static mediaInstances: Map<string, MediaInteface> = new Map();
    static readonly channels: Map<string, AudioChannelInterface> = new Map();
    static transients: Set<Player> = new Set();
    /** Tone.js audio buffers keyed by sound alias. */
    static readonly bufferRegistry: CachedMap<string, ToneAudioBuffer> = new CachedMap({
        cacheSize: 10,
    });
}
