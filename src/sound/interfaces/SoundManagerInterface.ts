import { Sound, SoundLibrary } from "@pixi/sound";
import SoundGameState from "./SoundGameState";
import SoundOptions from "./SoundOptions";

export default interface SoundManagerInterface extends Omit<SoundLibrary, "init" | "add" | "close"> {
    /**
     * Adds a new sound by alias.
     * @param alias - The sound alias reference.
     * @param options - Either the path or url to the source file.
     *        or the object of options to use.
     * @return Instance of the Sound object.
     */
    add(alias: string, sourceOptions: SoundOptions | string): Sound;
    clear(): void;
    export(): SoundGameState;
    removeOldSoundAndExport(): SoundGameState;
    restore(data: object): void;
}
