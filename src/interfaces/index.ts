export type { ExportedSound, default as ExportedSounds } from "./export/ExportedSounds";
export type { default as ExportedStorage } from "./export/ExportedStorage";
export type {
    default as GameState,
    /**
     *  @deprecated use "import { GameState } from '@drincs/pixi-vn';"
     */
    default as SaveData,
} from "./GameState";
export type { default as StorageManagerInterface } from "./managers/StorageManagerInterface";
export type { default as SoundOptions, SoundPlayOptions } from "./SoundOptions";
