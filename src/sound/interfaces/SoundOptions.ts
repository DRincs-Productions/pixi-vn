import type AudioFilter from "./AudioFilter";

export default interface SoundOptions {
    /** Auto play on load. */
    autoPlay?: boolean;
    /** Pre-load sound. */
    preload?: boolean;
    /** Initial volume (0–1). */
    volume?: number;
    /** Initial playback speed multiplier. */
    speed?: number;
    /** Whether the sound loops. */
    loop?: boolean;
    /** Whether the sound starts muted. */
    muted?: boolean;
    /** Initial filters to apply. */
    filters?: AudioFilter[];
    /** Only allow a single concurrent instance of this sound. */
    singleInstance?: boolean;
}

export interface SoundPlayOptions extends SoundOptions {
    /** Offset in seconds from which to start playback. */
    start?: number;
    /** Time in seconds at which to stop playback. */
    end?: number;
    /** Sprite identifier (for sprite-sheet sounds). */
    sprite?: string;
    /**
     * The delay in seconds before playback becomes audible or resumes. If
     * specified the sound is started immediately but paused so that it is
     * effectively heard only after the delay has elapsed.
     */
    delay?: number;
    /**
     * Whether the sound starts in a paused state. If omitted the sound plays
     * immediately.
     */
    paused?: boolean;
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
}
