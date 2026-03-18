import SoundManagerInterface from "./interfaces/SoundManagerInterface";
import SoundManager from "./SoundManager";

export { default as AudioChannel } from "./classes/AudioChannel";
export { filters } from "./constants";
export type { default as AudioChannelInterface } from "./interfaces/AudioChannelInterface";
export type { default as IMediaInstance } from "./interfaces/IMediaInstance";
export type {
    ExportedSound,
    ExportedSoundPlay,
    default as SoundGameState,
    SoundPlay,
} from "./interfaces/SoundGameState";
export type { ChannelOptions, default as SoundOptions, SoundPlayOptions } from "./interfaces/SoundOptions";
export { default as SoundManagerStatic } from "./SoundManagerStatic";
export type { default as SoundFilterMemory } from "./types/SoundFilterMemory";
export { sound };

const sound: SoundManagerInterface = new SoundManager();
