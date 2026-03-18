import type { Assets } from "@drincs/pixi-vn/pixi.js";
import { Sound, SoundLibrary } from "@pixi/sound";
import AudioChannelInterface from "./AudioChannelInterface";
import IMediaInstance from "./IMediaInstance";
import SoundGameState from "./SoundGameState";
import SoundOptions, { SoundPlayOptions } from "./SoundOptions";

export default interface SoundManagerInterface extends Omit<SoundLibrary, "init" | "close" | "add" | "play" | "find"> {
    /**
     * @deprecated You can define sound assets directly in {@link Assets}
     */
    add(alias: string, options?: string): Sound;
    /**
     * Plays a sound.
     * @param alias The sound alias reference.
     * @param options The options
     * @return The sound instance,
     *        this cannot be reused after it is done playing. Returns a Promise if the sound
     *        has not yet loaded.
     */
    play(alias: string, options?: SoundPlayOptions): Promise<IMediaInstance>;
    /**
     * Edits the options of an existing sound (asset).
     * If the asset is not yet loaded, it will be loaded with the new options.
     */
    edit(alias: string, options: SoundOptions): Promise<void>;
    load(alias: string | string[]): Promise<void>;
    backgroundLoad(alias: string | string[]): Promise<void>;
    backgroundLoadBundle(alias: string): Promise<void>;
    clear(): void;
    /* Channel Methods */
    /**
     * Adds a new audio channel with the specified alias(es).
     * @param alias The alias or aliases for the new channel.
     * @returns The created AudioChannelInterface instance, or undefined if a channel with the alias already exists.
     */
    addChannel(alias: string | string[]): AudioChannelInterface | undefined;
    /**
     * Finds and returns the audio channel associated with the given alias. If the channel does not exist, it will be created.
     * @param alias The alias of the audio channel to find.
     * @returns The AudioChannelInterface instance associated with the alias.
     */
    findChannel(alias: string): AudioChannelInterface;
    /**
     * Returns an array of all existing audio channels.
     */
    readonly channels: AudioChannelInterface[];
    /* Export and Import Methods */
    export(): SoundGameState;
    restore(data: object): Promise<void>;
}
