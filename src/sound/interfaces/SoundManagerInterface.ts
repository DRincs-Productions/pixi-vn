import type AudioFilter from "./AudioFilter";
import type AudioChannelInterface from "./AudioChannelInterface";
import type IMediaInstance from "./IMediaInstance";
import type SoundGameState from "./SoundGameState";
import type SoundOptions from "./SoundOptions";
import type { ChannelOptions, SoundPlayOptionsWithChannel } from "./SoundOptions";

export default interface SoundManagerInterface {
    // ------------------------------------------------------------------ //
    // Global audio-bus properties                                          //
    // ------------------------------------------------------------------ //

    /** The underlying Web Audio `AudioContext`. */
    readonly context: AudioContext;
    /** Global filters applied to all sounds. */
    filtersAll: AudioFilter[];
    /** Whether Web Audio is supported in the current environment. */
    readonly supported: boolean;
    /**
     * @deprecated No-op – legacy HTML5 Audio fallback is not used.
     */
    useLegacy: boolean;
    /**
     * @deprecated No-op – auto-pause is handled by the application.
     */
    disableAutoPause: boolean;
    /** Master volume in the range [0, 1]. */
    volumeAll: number;
    /** Master playback speed multiplier. */
    speedAll: number;

    // ------------------------------------------------------------------ //
    // Default channel                                                      //
    // ------------------------------------------------------------------ //

    /**
     * The default channel alias used when playing a sound without specifying a
     * channel. Defaults to `"general"`.
     */
    defaultChannelAlias: string;

    // ------------------------------------------------------------------ //
    // Sound registration                                                   //
    // ------------------------------------------------------------------ //

    /**
     * @deprecated Register sound assets directly via `PIXI.Assets` instead.
     */
    add(alias: string, options: string): void;

    /**
     * Edit the options of an already-registered sound asset.
     * If the asset has not been loaded yet it will be loaded first.
     */
    edit(alias: string, options: SoundOptions): Promise<void>;

    // ------------------------------------------------------------------ //
    // Playback                                                             //
    // ------------------------------------------------------------------ //

    /**
     * Plays a sound.
     * @param alias The media and sound (asset) alias reference.
     * @param options The options.
     * @returns The media instance (resolves immediately if already loaded).
     */
    play(alias: string, options?: SoundPlayOptionsWithChannel): Promise<IMediaInstance>;
    play(
        mediaAlias: string,
        soundAlias: string,
        options?: SoundPlayOptionsWithChannel,
    ): Promise<IMediaInstance>;

    /**
     * Plays a non-persistent ("transient") sound (e.g. UI / menu sounds).
     * Transient playback is not tracked in save/export state.
     */
    playTransient(alias: string, options?: SoundPlayOptionsWithChannel): Promise<IMediaInstance>;

    /**
     * Find a tracked media instance by alias.
     */
    find(alias: string): IMediaInstance | undefined;

    /**
     * Stop a tracked media instance and remove it from the manager.
     */
    stop(alias: string): void;

    /**
     * Pause a tracked media instance.
     */
    pause(alias: string): IMediaInstance | undefined;

    /**
     * Resume a paused media instance.
     */
    resume(alias: string): IMediaInstance | undefined;

    /** Returns `true` if any sound is currently playing. */
    isPlaying(): boolean;

    /** Duration in seconds of the loaded sound with the given alias. */
    duration(alias: string): number;

    // ------------------------------------------------------------------ //
    // Global playback controls                                             //
    // ------------------------------------------------------------------ //

    /** Toggle mute on all sounds. Returns the new muted state. */
    toggleMuteAll(): boolean;
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
     * If `channel` is provided only that channel's instances are affected.
     */
    stopTransientAll(channel?: string): this;

    // ------------------------------------------------------------------ //
    // Loading                                                              //
    // ------------------------------------------------------------------ //

    /** Load one or more sound assets. */
    load(alias: string | string[]): Promise<void>;
    /** Trigger background loading of one or more sound assets. */
    backgroundLoad(alias: string | string[]): Promise<void>;
    /** Trigger background loading of a sound bundle. */
    backgroundLoadBundle(alias: string): Promise<void>;

    /** Stop all sounds and clear internal state. */
    clear(): void;

    // ------------------------------------------------------------------ //
    // Channels                                                             //
    // ------------------------------------------------------------------ //

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

    // ------------------------------------------------------------------ //
    // State export / restore                                               //
    // ------------------------------------------------------------------ //

    export(): SoundGameState;
    restore(data: object): Promise<void>;
}

