import { Options, PlayOptions } from "@pixi/sound";

export default interface SoundOptions
    extends Omit<Options, "complete" | "loaded" | "sprites" | "source"> {}

export interface SoundPlayOptions extends Omit<PlayOptions, "complete" | "loaded"> {
    /**
     * The delay in seconds before playback becomes audible or resumes. If specified, the sound will be started immediately but delayed (for example, via pause/unpause) so that it is effectively heard only after the delay. If not specified, the sound will play without any additional delay.
     */
    delay?: number;
}
export interface SoundPlayOptionsWithChannel extends SoundPlayOptions {
    /**
     * The alias of the audio channel to play the sound on. If the channel does not exist, it will be created.
     * If not specified, the sound will be played on the default channel (see `SoundManagerInterface.defaultChannelAlias`).
     */
    channel?: string;
}
export interface ChannelOptions extends Pick<SoundPlayOptions, "filters" | "muted" | "volume"> {
    /**
     * Whether this channel is a background channel.
     * Background channels are special channels. Unlike normal channels, media connected to a background channel does not stop when a scene changes, but continues to play in the background.
     */
    background?: boolean;
}
