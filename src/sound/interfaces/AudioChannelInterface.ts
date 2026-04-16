import type IMediaInstance from "./IMediaInstance";
import type { SoundPlayOptions } from "./SoundOptions";

export default interface AudioChannelInterface {
    /**
     * The alias of the audio channel. This is used to reference the channel when playing sounds. The alias must be unique among all channels.
     */
    readonly alias: string;
    /**
     * Plays a sound.
     * @param alias The media and sound (asset) alias reference.
     * @param options The options
     * @return The sound instance,
     *        this cannot be reused after it is done playing. Returns a Promise if the sound
     *        has not yet loaded.
     */
    play(alias: string, options?: SoundPlayOptions): Promise<IMediaInstance>;
    /**
     * Plays a sound.
     * @param mediaAlias The media alias reference.
     * @param soundAlias The sound (asset) alias reference.
     * @param options The options
     * @return The sound instance,
     *        this cannot be reused after it is done playing. Returns a Promise if the sound
     *        has not yet loaded.
     */
    play(
        mediaAlias: string,
        soundAlias: string,
        options?: SoundPlayOptions,
    ): Promise<IMediaInstance>;
    /**
     * The volume of the audio channel, between 0 and 1. This is multiplied with the volume of each sound played through this channel.
     */
    volume: number;
    /**
     * Whether the audio channel is muted. This is combined with the muted state of each sound played through this channel.
     */
    muted: boolean;
    /**
     * The MediaInstances currently playing through this channel. This is read-only and cannot be modified directly. Use the play method to add new MediaInstances to this channel.
     */
    readonly mediaInstances: IMediaInstance[];
    /**
     * Whether this channel is a background channel.
     * Background channels are special channels. Unlike normal channels, media connected to a background channel does not stop when a scene changes, but continues to play in the background.
     */
    readonly background: boolean;
    /**
     * Stops all media currently playing through this channel.
     * @return Instance for chaining.
     */
    stopAll(): this;
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
     * Toggle muted property for all sounds.
     * @return `true` if all sounds are muted.
     */
    toggleMuteAll(): boolean;
}
