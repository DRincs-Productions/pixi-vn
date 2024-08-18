import { Options, PlayOptions } from "@pixi/sound";
import { SoundFilterMemory } from "../../types";

export interface ExportedSound {
    [key: string]: {
        options: Options,
        filters?: SoundFilterMemory[]
    }
}

export interface ExportedSoundPlay {
    [key: string]: {
        stepIndex: number,
        paused: boolean,
        options?: PlayOptions | string
    }
}

/**
 * Interface exported sounds
 */
export default interface ExportedSounds {
    sounds: ExportedSound
    childrenTagsOrder: string[]
    filters?: SoundFilterMemory[]
    playInStepIndex: ExportedSoundPlay
}
