export default interface IMediaInstance {
    /** Unique numeric identifier for this instance. */
    readonly id: number;
    /** Whether the sound is currently paused. */
    paused: boolean;
    /** Linear volume in the range [0, 1]. */
    volume: number;
    /** Whether the sound is looping. */
    loop: boolean;
    /** Whether the sound is muted. */
    muted: boolean;
    /** Playback speed multiplier (1 = normal). */
    speed: number;
    /** Stop playback and clean up resources. */
    stop(): void;
    /**
     * Register an event listener.
     * The `"end"` event is fired when the sound finishes playing naturally.
     */
    on(event: string, fn: (...args: unknown[]) => void): void;
}
