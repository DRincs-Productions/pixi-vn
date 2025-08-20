import SoundManager from "./SoundManager";

export { default as Sound } from "./classes/Sound";
export { filters } from "./constants";
export type { ExportedSound, default as SoundGameState } from "./interfaces/SoundGameState";
export type { default as SoundOptions, SoundPlayOptions } from "./interfaces/SoundOptions";
export { default as SoundManagerStatic } from "./SoundManagerStatic";
export type { default as SoundFilterMemory } from "./types/SoundFilterMemory";
export { sound };

const sound = new SoundManager();
