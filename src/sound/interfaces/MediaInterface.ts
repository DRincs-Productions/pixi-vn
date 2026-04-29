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

export interface MediaMemory extends Partial<Omit<PlayerOptions, "url" | "volume">> {
    /**
     * The volume of this sound in the linear range [0, 1], where 0 is silence
     * and 1 is full volume. Stored and restored in linear form; converted
     * to/from Tone.js decibels internally.
     */
    volume?: number;
    elapsed: number | undefined;
    paused: boolean;
    delay?: number;
}
