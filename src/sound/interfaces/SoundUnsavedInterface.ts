import type { Player, PlayerOptions } from "tone";

export default interface SoundUnsavedInterface {
    /**
     * Plays a non-persistent ("transient") sound (e.g. UI / menu sounds).
     * Transient playback is not tracked in save/export state.
     */
    playTransient(alias: string, options?: Partial<PlayerOptions>): Promise<Player>;
    /**
     * Temporarily pause all currently-playing sounds (or just those in the given
     * channel) without persisting the paused state. Useful for overlays / pause
     * menus.
     *
     * Only sounds that are **actively playing** at the time of the call are paused;
     * sounds that were already paused beforehand are left untouched so that they
     * remain paused when {@link resumeAll} is called later.
     *
     * When called without a channel argument all transient players started with
     * {@link playTransient} are also stopped.
     */
    pauseAll(channel?: string): this;
    /**
     * Resume all sounds (or just those in the given channel) that were paused by
     * the most recent call to {@link pauseAll}. Sounds that were already
     * paused before `pauseAll` was called are **not** resumed.
     */
    resumeAll(channel?: string): this;
    /**
     * Stop all transient media instances started with {@link playTransient}.
     */
    stopTransientAll(): this;
}
