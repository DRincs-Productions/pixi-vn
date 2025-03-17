import SoundManager from "./SoundManager";

export { default as Sound } from "./classes/Sound";
export type { ExportedSound, default as ExportedSounds } from "./interfaces/ExportedSounds";
export type { default as SoundOptions, SoundPlayOptions } from "./interfaces/SoundOptions";
export { default as SoundManagerStatic } from "./SoundManagerStatic";
export type { default as SoundFilterMemory } from "./types/SoundFilterMemory";
export { sound };

const sound = new SoundManager();
