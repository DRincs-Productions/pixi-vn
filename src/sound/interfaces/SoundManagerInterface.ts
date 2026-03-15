import type { Assets } from "@drincs/pixi-vn/pixi.js";
import { Sound, SoundLibrary } from "@pixi/sound";
import AudioChannelInterface from "./AudioChannelInterface";
import SoundGameState from "./SoundGameState";
import { SoundPlayOptions } from "./SoundOptions";

export default interface SoundManagerInterface extends Omit<SoundLibrary, "init" | "close" | "add" | "play"> {
    /**
     * @deprecated You can define sound assets directly in {@link Assets}
     */
    add(alias: string, options?: string): Sound;
    /**
     * Plays a sound.
     * @param alias - The sound alias reference.
     * @param options - The options
     * @return The sound instance,
     *        this cannot be reused after it is done playing. Returns a Promise if the sound
     *        has not yet loaded.
     */
    play(alias: string, options?: SoundPlayOptions): Promise<AudioChannelInterface>;
    backgroundLoad(alias: string | string[]): Promise<void>;
    backgroundLoadBundle(alias: string): Promise<void>;
    clear(): void;
    export(): SoundGameState;
    removeOldSoundAndExport(): SoundGameState;
    restore(data: object): void;
}
