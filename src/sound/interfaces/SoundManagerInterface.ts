import { Sound, SoundLibrary } from "@pixi/sound";
import AudioChannelInterface from "./AudioChannelInterface";
import IMediaInstance from "./IMediaInstance";
import SoundGameState from "./SoundGameState";
import SoundOptions, { ChannelOptions, SoundPlayOptionsWithChannel } from "./SoundOptions";

export default interface SoundManagerInterface extends Omit<
    SoundLibrary,
    | "init"
    | "close"
    | "add"
    | "play"
    | "volume"
    | "speed"
    | "remove"
    | "exists"
    | "find"
    | "stop"
    | "pause"
    | "resume"
    | "pauseAll"
    | "resumeAll"
    | "muteAll"
    | "unmuteAll"
    | "stopAll"
    | "removeAll"
    | "togglePauseAll"
> {
    /**
     * @deprecated You can define sound assets directly in `PIXI.Assets`
     */
    add(alias: string, options: string): Sound;
    /**
     * Plays a sound.
     * @param alias The media and sound (asset) alias reference.
     * @param options The options
     * @return The sound instance,
     *        this cannot be reused after it is done playing. Returns a Promise if the sound
     *        has not yet loaded.
     */
    play(alias: string, options?: SoundPlayOptionsWithChannel): Promise<IMediaInstance>;
    play(mediaAlias: string, soundAlias: string, options?: SoundPlayOptionsWithChannel): Promise<IMediaInstance>;
    /**
     * Find a media by alias.
     * @param alias - The media alias reference.
     * @return Media object.
     */
    find(alias: string): IMediaInstance | undefined;
    /**
     * Stops a media and removes it from the manager.
     * @param alias - The media alias reference.
     */
    stop(alias: string): void;
    /**
     * Pauses a media.
     * @param alias - The media alias reference.
     * @return Media object.
     */
    pause(alias: string): IMediaInstance | undefined;
    /**
     * Resumes a media.
     * @param alias - The media alias reference.
     * @return Media object.
     */
    resume(alias: string): IMediaInstance | undefined;
    /**
     * Edits the options of an existing sound (asset).
     * If the asset is not yet loaded, it will be loaded with the new options.
     */
    edit(alias: string, options: SoundOptions): Promise<void>;
    /**
     * Pauses any playing sounds.
     * @return Instance for chaining.
     */
    pauseAll(): this;
    /**
     * Resumes any sounds.
     * @return Instance for chaining.
     */
    resumeAll(): this;
    /**
     * Mutes all playing sounds.
     * @return Instance for chaining.
     */
    muteAll(): this;
    /**
     * Unmutes all playing sounds.
     * @return Instance for chaining.
     */
    unmuteAll(): this;
    /**
     * Stops all sounds.
     * @return Instance for chaining.
     */
    stopAll(): this;
    load(alias: string | string[]): Promise<Sound[]>;
    backgroundLoad(alias: string | string[]): Promise<void>;
    backgroundLoadBundle(alias: string): Promise<void>;
    clear(): void;
    /* Channel Methods */
    /**
     * Adds a new audio channel with the specified alias(es).
     * @param alias The alias or aliases for the new channel.
     * @returns The created AudioChannelInterface instance, or undefined if a channel with the alias already exists.
     */
    addChannel(alias: string | string[], options?: ChannelOptions): AudioChannelInterface | undefined;
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
    /**
     * The default channel alias to use when playing a sound without specifying a channel.
     * By default, this is set to `GENERAL_CHANNEL` ("general"), but it can be changed to any string; if the channel does not yet exist, it will be created on demand when used.
     */
    defaultChannelAlias: string;
    /* Export and Import Methods */
    export(): SoundGameState;
    restore(data: object): Promise<void>;
}
