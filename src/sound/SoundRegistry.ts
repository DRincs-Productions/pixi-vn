import CachedMap from "@classes/CachedMap";
import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type MediaInteface from "@sound/interfaces/MediaInteface";
import { Gain, getDestination, type Player, type ToneAudioBuffer } from "tone";

namespace SoundRegistry {
    export const freezeBus = new Gain(1).toDestination();
    export const liveBus = getDestination();
    export const mediaInstances: Map<string, MediaInteface> = new Map();
    export const channels: Map<string, AudioChannelInterface> = new Map();
    export const transients: Set<Player> = new Set();
    export const bufferRegistry: CachedMap<string, ToneAudioBuffer> = new CachedMap({
        cacheSize: 10,
    });
}
export default SoundRegistry;
