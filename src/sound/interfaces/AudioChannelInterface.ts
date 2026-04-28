import type MediaInterface from "@sound/interfaces/MediaInterface";
import type { SoundPlayOptions } from "@sound/interfaces/SoundOptions";
import type { InputNode, Param } from "tone";

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
    play(alias: string, options?: SoundPlayOptions): Promise<MediaInterface>;
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
    ): Promise<MediaInterface>;
    /**
     * The stereo pan position for this channel in the range [-1, 1].
     * -1 is full left, 0 is centre, 1 is full right.
     */
    pan: number;
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
    readonly mediaInstances: MediaInterface[];
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
    /**
     * Useful for inserting channel-wide audio effects such as reverb, delay or
     * EQ.  Internally this disconnects the channel from its current destination
     * and reconnects it through the provided nodes in series, ending at the
     * master output.
     *
     * Install "tone" to use this method.
     *
     * @param nodes One or more Tone.js {@link InputNode} instances to chain in series.
     * @return Instance for chaining.
     *
     * @example
     * ```ts
     * import * as Tone from "tone";
     *
     * const channel = sound.findChannel("music");
     *
     * // Create a reverb effect and wait for its impulse response to be ready.
     * const reverb = new Tone.Reverb({ decay: 2.5 });
     * await reverb.ready;
     *
     * // Route the channel through the reverb to the master output.
     * channel.chain(reverb);
     * ```
     */
    chain(...nodes: InputNode[]): this;
    /**
     * **Advanced** — the raw `Tone.Param<"decibels">` for this channel's volume.
     *
     * Unlike the {@link volume} property (which uses a linear 0–1 scale), this
     * Param works directly in **decibels** and exposes all Tone.js automation
     * methods such as `rampTo`, `linearRampTo`, and `exponentialRampTo`.
     *
     * Use this when you need to smoothly automate volume over time instead of
     * setting it instantly.
     *
     * @example
     * ```ts
     * const channel = sound.findChannel("music");
     *
     * // Fade the volume from its current level to -12 dB over 3 seconds.
     * channel.volumeParam.rampTo(-12, 3);
     *
     * // Fade to silence over 2 seconds.
     * channel.volumeParam.rampTo(-Infinity, 2);
     * ```
     */
    readonly volumeParam: Param<"decibels">;
    /**
     * **Advanced** — the raw `Tone.Param<"audioRange">` for this channel's
     * stereo pan position.
     *
     * Unlike the {@link pan} property (which sets the value instantly), this
     * Param exposes all Tone.js automation methods such as `rampTo`,
     * `linearRampTo`, and `exponentialRampTo`.
     *
     * Use this when you need to smoothly automate panning over time instead of
     * setting it instantly.  Values range from -1 (full left) to 1 (full right).
     *
     * @example
     * ```ts
     * const channel = sound.findChannel("music");
     *
     * // Gradually pan to the left over 3 seconds.
     * channel.panParam.rampTo(-1, 3);
     *
     * // Return to centre over 2 seconds.
     * channel.panParam.rampTo(0, 2);
     * ```
     */
    readonly panParam: Param<"audioRange">;
}
