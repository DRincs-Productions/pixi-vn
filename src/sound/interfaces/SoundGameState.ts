import type SoundOptions from "@sound/interfaces/SoundOptions";
import type { SoundPlayOptions } from "@sound/interfaces/SoundOptions";
import type SoundFilterMemory from "@sound/types/SoundFilterMemory";

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
    /**
     * @deprecated
     */
    soundsPlaying?: { [key: string]: ExportedSoundPlay };
    mediaInstances: {
        [key: string]: {
            channelAlias: string;
            soundAlias: string;
            stepCounter: number;
            options: Omit<SoundPlayOptions, "filters"> & {
                filters?: SoundFilterMemory[];
                delay?: number;
            };
            /**
             * @deprecated Use options.paused instead.
             */
            paused?: boolean;
        };
    };
}
