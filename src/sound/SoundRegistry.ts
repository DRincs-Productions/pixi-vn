import CachedMap from "@classes/CachedMap";
import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type MediaInterface from "@sound/interfaces/MediaInterface";
import { Gain, getDestination, type Player, type ToneAudioBuffer } from "tone";

/**
 * SoundRegistry is a singleton namespace that holds global state for the sound system.
 * **DO NOT** import this module directly; use `sound`.
 */
namespace SoundRegistry {
    export const freezeBus = new Gain(1).toDestination();
    export const liveBus = getDestination();
    export const mediaInstances: Map<string, MediaInterface> = new Map();
    export const channels: Map<string, AudioChannelInterface> = new Map();
    export const transients: Set<Player> = new Set();
    export const bufferRegistry: CachedMap<string, ToneAudioBuffer> = new CachedMap({
        cacheSize: 10,
    });
}
export default SoundRegistry;
