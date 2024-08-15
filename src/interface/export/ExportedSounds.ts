import { Options } from "@pixi/sound";
import { SoundFiltersMemory } from "../../types";

export interface ExportedSound {
    [key: string]: {
        options: Options,
        isPlaying: boolean,
        filters: SoundFiltersMemory[]
    }
}

/**
 * Interface exported sounds
 */
export default interface ExportedSounds {
    sounds: ExportedSound
}
