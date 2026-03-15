import { SoundLibrary } from "@pixi/sound";
import { SoundPlayOptions } from "./SoundOptions";

export default interface AudioChannelInterface extends Omit<
    SoundLibrary,
    "init" | "add" | "context" | "filtersAll" | "supported" | "useLegacy" | "close" | "play" | "disableAutoPause"
> {
    /**
     * Plays a sound.
     * @param alias - The sound alias reference.
     * @param options - The options or callback when done.
     * @return The sound instance,
     *        this cannot be reused after it is done playing. Returns a Promise if the sound
     *        has not yet loaded.
     */
    play(alias: string, options?: SoundPlayOptions): Promise<AudioChannelInterface>;
}
