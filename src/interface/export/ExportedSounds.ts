import { Options } from "@pixi/sound";
import { SoundFilterMemory } from "../../types";

export interface ExportedSound {
    [key: string]: {
        options: Options,
        isPlaying: boolean,
        filters?: SoundFilterMemory[]
    }
}

/**
 * Interface exported sounds
 */
export default interface ExportedSounds {
    sounds: ExportedSound
    childrenTagsOrder: string[]
    filters?: SoundFilterMemory[]
}
