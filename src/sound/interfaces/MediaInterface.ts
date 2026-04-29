import type { Player, PlayerOptions } from "tone";

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
        | "volume"
        | "state"
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
}

export interface MediaMemory extends Partial<PlayerOptions> {
    elapsed: number | undefined;
    paused: boolean;
}
