import { SoundFilterMemory } from "../../types";
import SoundOptions, { SoundPlayOptions } from "../SoundOptions";

export interface ExportedSound {
    [key: string]: {
        options: SoundOptions,
        filters?: SoundFilterMemory[]
    }
}

export interface ExportedSoundPlay {
    [key: string]: {
        stepIndex: number,
        paused: boolean,
        options?: SoundPlayOptions | string
    }
}

/**
 * Interface exported sounds
 */
export default interface ExportedSounds {
    sounds: ExportedSound
    soundAliasesOrder: string[]
    filters?: SoundFilterMemory[]
    playInStepIndex: ExportedSoundPlay
}
