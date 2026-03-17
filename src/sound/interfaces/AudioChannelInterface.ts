import IMediaInstance from "./IMediaInstance";
import { SoundPlayOptions } from "./SoundOptions";

export default interface AudioChannelInterface {
    /**
     * Plays a sound.
     * @param alias - The sound alias reference.
     * @param options - The options or callback when done.
     * @return The sound instance,
     *        this cannot be reused after it is done playing. Returns a Promise if the sound
     *        has not yet loaded.
     */
    play(alias: string, options?: SoundPlayOptions): Promise<IMediaInstance>;
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
}
