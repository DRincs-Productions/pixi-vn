import type SoundFilterMemory from "../types/SoundFilterMemory";
import type SoundOptions from "./SoundOptions";
import type { SoundPlayOptions } from "./SoundOptions";

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
export default interface SoundGameState {
    filters?: SoundFilterMemory[];
    /**
     * @deprecated
     */
    soundsPlaying?: { [key: string]: ExportedSoundPlay };
    mediaInstances: {
        [key: string]: {
            channelAlias: string;
            soundAlias: string;
            stepCounter: number;
            options: Omit<SoundPlayOptions, "filters"> & { filters?: SoundFilterMemory[] };
            /**
             * @deprecated Use options.paused instead.
             */
            paused?: boolean;
        };
    };
}
