import { Options, PlayOptions } from "@pixi/sound";
import { GENERAL_CHANNEL } from "../../constants";

export default interface SoundOptions extends Omit<Options, "complete" | "loaded" | "sprites" | "source"> {}

export interface SoundPlayOptions extends Omit<PlayOptions, "complete" | "loaded"> {}
export interface SoundPlayOptionsWithChannel extends SoundPlayOptions {
    /**
     * The alias of the audio channel to play the sound on. If the channel does not exist, it will be created.
     * If not specified, the sound will be played on the general channel {@link GENERAL_CHANNEL}.
     */
    channel?: string;
}
export interface ChannelOptions extends Pick<SoundPlayOptions, "filters" | "muted" | "volume"> {}
