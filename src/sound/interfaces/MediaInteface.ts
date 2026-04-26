import type { BasicPlaybackState, Player, PlayerOptions } from "tone";

export default interface MediaInteface
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
        | "volume"
        | "chain"
        | "disconnect"
    > {
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
    offset: number;
    paused: boolean;
}
