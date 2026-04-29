import type { BasicPlaybackState, Player, PlayerOptions } from "tone";
import type { Param } from "tone";

export default interface MediaInterface
    extends Pick<
        Player,
        | "blockTime"
        | "disposed"
        | "loaded"
        | "loop"
        | "loopEnd"
        | "loopStart"
        | "mute"
        | "now"
        | "playbackRate"
        | "reverse"
        | "restart"
        | "start"
        | "stop"
        | "chain"
        | "disconnect"
    > {
    /**
     * The volume of this sound in the linear range [0, 1], where 0 is silence
     * and 1 is full volume.
     */
    volume: number;
    /**
     * **Advanced** — the raw `Tone.Param<"decibels">` for this instance's volume.
     *
     * Unlike the {@link volume} property (which uses a linear 0–1 scale), this
     * Param works directly in **decibels** and exposes all Tone.js automation
     * methods such as `rampTo`, `linearRampTo`, and `exponentialRampTo`.
     */
    readonly volumeParam: Param<"decibels">;
    /**
     * Whether the sound is currently paused.
     */
    paused: boolean;
    /**
     * @deprecated Use {@link mute} instead.
     */
    muted: boolean;
    /**
     * @deprecated Use {@link playbackRate} instead.
     */
    speed: number;
    /**
     * Returns the playback state of the source, either "started" or "stopped" or "paused".
     * @example
     * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/ahntone_c3.mp3", () => {
     * 	player.start();
     * 	console.log(player.state);
     * }).toDestination();
     */
    readonly state: BasicPlaybackState | "paused";
}

export interface MediaMemory extends Partial<PlayerOptions> {
    elapsed: number | undefined;
    paused: boolean;
}
