import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type MediaInterface from "@sound/interfaces/MediaInterface";
import type SoundGameState from "@sound/interfaces/SoundGameState";
import type { ChannelOptions, SoundPlayOptionsWithChannel } from "@sound/interfaces/SoundOptions";
import type { Player, PlayerOptions } from "tone";

export default interface SoundManagerInterface {
    /** Master volume in the range [0, 1]. */
    volumeAll: number;
    /**
     * @deprecated Global playback speed. This is not a well-supported feature and may be removed in a future release. Use individual sound speed options instead.
     */
    speedAll: number;

    /**
     * The default channel alias used when playing a sound without specifying a
     * channel. Defaults to `"general"`.
     */
    defaultChannelAlias: string;

    /**
     * @deprecated Register sound assets directly via `PIXI.Assets` instead.
     */
    add(alias: string, options: string): void;

    /**
     * Plays a sound.
     * @param alias The media and sound (asset) alias reference.
     * @param options The options.
     * @returns The media instance (resolves immediately if already loaded).
     */
    play(alias: string, options?: SoundPlayOptionsWithChannel): Promise<MediaInterface>;
    play(
        mediaAlias: string,
        soundAlias: string,
        options?: SoundPlayOptionsWithChannel,
    ): Promise<MediaInterface>;

    /**
     * Plays a non-persistent ("transient") sound (e.g. UI / menu sounds).
     * Transient playback is not tracked in save/export state.
     */
    playTransient(alias: string, options?: Partial<PlayerOptions>): Promise<Player>;

    /**
     * Find a tracked media instance by alias.
     */
    find(alias: string): MediaInterface | undefined;

    /**
     * Stop a tracked media instance and remove it from the manager.
     */
    stop(alias: string): void;

    /**
     * Pause a tracked media instance.
     */
    pause(alias: string): MediaInterface | undefined;

    /**
     * Resume a paused media instance.
     */
    resume(alias: string): MediaInterface | undefined;

    /** Duration in seconds of the loaded sound with the given alias. */
    duration(alias: string): number;

    /** Toggle mute on all sounds. Returns the new muted state. */
    toggleMuteAll(): boolean;
    /**
     * Whether all sounds are currently muted. Note that individual channels or media instances may still be muted or unmuted; this is just the global master mute state.
     */
    readonly muted: boolean;
    /** Mute all sounds. */
    muteAll(): this;
    /** Unmute all sounds. */
    unmuteAll(): this;
    /** Stop all sounds. */
    stopAll(): this;
    /** Pause all sounds. */
    pauseAll(): this;
    /** Resume all sounds. */
    resumeAll(): this;
    /**
     * Temporarily pause all sounds (or just the given channel) without
     * persisting the paused option. Useful for overlays / pause menus.
     */
    pauseUnsavedAll(channel?: string): this;
    /**
     * Restore all sounds (or just the given channel) after `pauseUnsavedAll()`.
     */
    resumeUnsavedAll(channel?: string): this;
    /**
     * Stop all transient media instances started with {@link playTransient}.
     */
    stopTransientAll(): this;

    /** Load one or more sound assets. */
    load(...alias: string[]): Promise<void>;
    /** Trigger background loading of one or more sound assets. */
    backgroundLoad(...alias: string[]): Promise<void>;
    /** Trigger background loading of a sound bundle. */
    backgroundLoadBundle(alias: string): Promise<void>;

    /** Stop all sounds and clear internal state. */
    clear(): void;

    /**
     * Add a new audio channel.
     * Returns the created channel, or `undefined` if the alias already exists.
     */
    addChannel(
        alias: string | string[],
        options?: ChannelOptions,
    ): AudioChannelInterface | undefined;

    /**
     * Find the channel for the given alias, creating it if it does not yet exist.
     */
    findChannel(alias: string): AudioChannelInterface;

    /** All registered audio channels. */
    readonly channels: AudioChannelInterface[];

    /**
     * Export the current sound state, including currently playing sounds and their options, for saving or debugging purposes. This is not guaranteed to be stable across versions and may contain implementation details; it is not intended for use in general application code.
     */
    export(): SoundGameState;
    /**
     * Restore a sound state exported by {@link export}. This will stop any currently playing sounds and replace them with the sounds specified in the exported state. This is not guaranteed to be stable across versions and may contain implementation details; it is not intended for use in general application code.
     */
    restore(data: object): Promise<void>;
}
