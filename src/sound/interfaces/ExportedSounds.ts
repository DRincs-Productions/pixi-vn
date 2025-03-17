import SoundFilterMemory from "../types/SoundFilterMemory";
import SoundOptions, { SoundPlayOptions } from "./SoundOptions";

export interface ExportedSound {
    options: SoundOptions;
    filters?: SoundFilterMemory[];
}

export interface SoundPlay {
    stepIndex: number;
    paused: boolean;
    options?: SoundPlayOptions | string;
}

export interface ExportedSoundPlay extends SoundPlay {
    sound: ExportedSound;
}

/**
 * Interface exported sounds
 */
export default interface ExportedSounds {
    soundAliasesOrder: string[];
    filters?: SoundFilterMemory[];
    soundsPlaying: { [key: string]: ExportedSoundPlay };
    /**
     * @deprecated
     */
    playInStepIndex?: { [key: string]: SoundPlay };
    /**
     * @deprecated
     */
    sounds?: ExportedSoundOld;
}

interface ExportedSoundOld {
    [key: string]: {
        options: SoundOptions;
        filters?: SoundFilterMemory[];
    };
}
