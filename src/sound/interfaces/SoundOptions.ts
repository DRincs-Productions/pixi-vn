import type { InputNode, PlayerOptions } from "tone";

export default interface SoundOptions
    extends Pick<
        Partial<PlayerOptions>,
        | "loop"
        | "autostart"
        | "fadeIn"
        | "fadeOut"
        | "volume"
        | "mute"
        | "loopEnd"
        | "loopStart"
        | "reverse"
        | "playbackRate"
    > {
    /**
     * An array of audio filters/effects to apply to this sound.
     *
     * Install "tone" for the full list of available filters.
     *
     * @example
     * ```ts
     * import * as Tone from "tone";
     *
     * const filters = [new Tone.FeedbackDelay("8n", 0.5)];
     * ```
     */
    filters?: InputNode[];
    /**
     * @deprecated Use {@link playbackRate} instead.
     */
    speed?: number;
    /**
     * @deprecated Use {@link mute} instead.
     */
    muted?: boolean;
    /**
     * @deprecated Use {@link autostart} instead.
     */
    paused?: boolean;
}

export interface SoundPlayOptions extends SoundOptions {
    /**
     * The delay in seconds before playback becomes audible or resumes. If
     * specified the sound is started immediately but paused so that it is
     * effectively heard only after the delay has elapsed.
     */
    delay?: number;
}

export interface SoundPlayOptionsWithChannel extends SoundPlayOptions {
    /**
     * The alias of the audio channel to play the sound on. If the channel does
     * not exist it will be created automatically.
     * Defaults to `SoundManagerInterface.defaultChannelAlias` ("general").
     */
    channel?: string;
}

export interface ChannelOptions
    extends Pick<SoundPlayOptions, "filters" | "muted" | "volume" | "paused"> {
    /**
     * Whether this channel is a background channel.
     * Background channels are special: media playing on them is not stopped
     * when a scene changes, but continues in the background.
     */
    background?: boolean;
    /**
     * The stereo pan position for this channel in the range [-1, 1].
     * -1 is full left, 0 is centre, 1 is full right.
     * Defaults to 0.
     */
    pan?: number;
}
