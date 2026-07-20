import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type { ChannelOptions } from "@sound/interfaces/SoundOptions";

export default interface SoundChannelsInterface {
    /**
     * Add a new audio channel.
     * Returns the created channel, or `undefined` if the alias already exists.
     */
    add(alias: string | string[], options?: ChannelOptions): AudioChannelInterface | undefined;
    /**
     * Find the channel for the given alias, creating it if it does not yet exist.
     */
    find(alias: string): AudioChannelInterface;
    /** All registered audio channels. */
    readonly values: AudioChannelInterface[];
}
