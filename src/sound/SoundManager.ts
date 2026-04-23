import * as Tone from "tone";
import { GENERAL_CHANNEL } from "@constants";
import { GameUnifier } from "@drincs/pixi-vn/core";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import AudioChannel from "@sound/classes/AudioChannel";
import { FilterMemoryToFilter, FilterToFilterMemory } from "@sound/functions/sound-utility";
import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type AudioFilter from "@sound/interfaces/AudioFilter";
import type IMediaInstance from "@sound/interfaces/IMediaInstance";
import type SoundGameState from "@sound/interfaces/SoundGameState";
import type SoundManagerInterface from "@sound/interfaces/SoundManagerInterface";
import type SoundOptions from "@sound/interfaces/SoundOptions";
import type {
    ChannelOptions,
    SoundPlayOptions,
    SoundPlayOptionsWithChannel,
} from "@sound/interfaces/SoundOptions";
import SoundManagerStatic from "@sound/SoundManagerStatic";
import type SoundFilterMemory from "@sound/types/SoundFilterMemory";
import { createExportableElement } from "@utils/export-utility";
import { logger } from "@utils/log-utility";

export default class SoundManager implements SoundManagerInterface {
    // ------------------------------------------------------------------ //
    // Global audio-bus properties                                          //
    // ------------------------------------------------------------------ //

    get context(): AudioContext {
        return Tone.getContext().rawContext as AudioContext;
    }

    private _filtersAll: AudioFilter[] = [];
    get filtersAll(): AudioFilter[] {
        return this._filtersAll;
    }
    set filtersAll(filtersAll: AudioFilter[]) {
        this._filtersAll = filtersAll;
    }

    get supported(): boolean {
        return typeof AudioContext !== "undefined" || typeof (window as any)?.webkitAudioContext !== "undefined";
    }

    /** @deprecated No-op — legacy HTML5 Audio fallback is not used with Tone.js. */
    get useLegacy(): boolean {
        return false;
    }
    /** @deprecated */
    set useLegacy(_legacy: boolean) {}

    /** @deprecated */
    get disableAutoPause(): boolean {
        return false;
    }
    /** @deprecated */
    set disableAutoPause(_autoPause: boolean) {}

    get volumeAll(): number {
        // Tone.Destination volume is in dB; convert back to linear [0, 1].
        const db = Tone.getDestination().volume.value;
        if (db === -Infinity) return 0;
        return Math.pow(10, db / 20);
    }
    set volumeAll(volume: number) {
        Tone.getDestination().volume.value = volume <= 0 ? -Infinity : 20 * Math.log10(volume);
    }

    get speedAll(): number {
        return this._speedAll;
    }
    set speedAll(speed: number) {
        this._speedAll = speed;
        // Apply to all currently active media instances.
        for (const mediaInstance of SoundManagerStatic.mediaInstances.values()) {
            mediaInstance.instance.speed = speed;
        }
    }
    private _speedAll = 1;

    // ------------------------------------------------------------------ //
    // Default channel                                                      //
    // ------------------------------------------------------------------ //

    _defaultChannelAlias = GENERAL_CHANNEL;
    get defaultChannelAlias(): string {
        return this._defaultChannelAlias;
    }
    set defaultChannelAlias(alias: string) {
        this._defaultChannelAlias = alias;
    }

    // ------------------------------------------------------------------ //
    // Sound registration                                                   //
    // ------------------------------------------------------------------ //

    /** @deprecated Register sound assets directly via `PIXI.Assets` instead. */
    add(alias: string, sourceOptions: string): void {
        if (!SoundManagerStatic.bufferRegistry.has(alias)) {
            const buffer = new Tone.ToneAudioBuffer(sourceOptions);
            SoundManagerStatic.bufferRegistry.set(alias, buffer);
        }
    }

    async edit(alias: string, options: SoundOptions): Promise<void> {
        if (!SoundManagerStatic.bufferRegistry.has(alias)) {
            await this.load(alias);
        }
        SoundManagerStatic.soundOptions.set(alias, options);
    }

    // ------------------------------------------------------------------ //
    // Global playback controls                                             //
    // ------------------------------------------------------------------ //

    pauseAll(): this {
        for (const mediaInstance of SoundManagerStatic.mediaInstances.values()) {
            if (!mediaInstance.instance.paused) {
                mediaInstance.instance.paused = true;
            }
        }
        return this;
    }
    resumeAll(): this {
        for (const mediaInstance of SoundManagerStatic.mediaInstances.values()) {
            if (mediaInstance.instance.paused) {
                mediaInstance.instance.paused = false;
            }
        }
        return this;
    }
    toggleMuteAll(): boolean {
        const newMuted = !Tone.getDestination().mute;
        Tone.getDestination().mute = newMuted;
        return newMuted;
    }
    muteAll(): this {
        Tone.getDestination().mute = true;
        return this;
    }
    unmuteAll(): this {
        Tone.getDestination().mute = false;
        return this;
    }
    stopAll(): this {
        for (const mediaInstance of SoundManagerStatic.mediaInstances.values()) {
            mediaInstance.instance.stop();
        }
        SoundManagerStatic.mediaInstances.clear();
        return this;
    }
    pauseUnsavedAll(channel?: string): this {
        if (channel !== undefined) {
            this.findChannel(channel).pauseUnsavedAll();
        } else {
            for (const ch of SoundManagerStatic.channels.values()) {
                ch.pauseUnsavedAll();
            }
        }
        return this;
    }
    resumeUnsavedAll(channel?: string): this {
        if (channel !== undefined) {
            this.findChannel(channel).resumeUnsavedAll();
        } else {
            for (const ch of SoundManagerStatic.channels.values()) {
                ch.resumeUnsavedAll();
            }
        }
        return this;
    }
    stopTransientAll(channel?: string): this {
        if (channel !== undefined) {
            this.findChannel(channel).stopTransientAll();
        } else {
            for (const ch of SoundManagerStatic.channels.values()) {
                ch.stopTransientAll();
            }
        }
        return this;
    }
    isPlaying(): boolean {
        return SoundManagerStatic.mediaInstances.size > 0;
    }

    // ------------------------------------------------------------------ //
    // Playback                                                             //
    // ------------------------------------------------------------------ //

    async play(alias: string, options?: SoundPlayOptionsWithChannel): Promise<IMediaInstance>;
    async play(
        mediaAlias: string,
        soundAlias: string,
        options?: SoundPlayOptionsWithChannel,
    ): Promise<IMediaInstance>;
    async play(
        aliasOrMediaAlias: string,
        soundAliasOrOptions?: string | SoundPlayOptionsWithChannel,
        paramOptions?: SoundPlayOptionsWithChannel,
    ): Promise<IMediaInstance> {
        let mediaAlias: string;
        let soundAlias: string;
        if (typeof soundAliasOrOptions === "string") {
            mediaAlias = aliasOrMediaAlias;
            soundAlias = soundAliasOrOptions;
        } else {
            mediaAlias = aliasOrMediaAlias;
            soundAlias = aliasOrMediaAlias;
            paramOptions = soundAliasOrOptions;
        }
        if (!SoundManagerStatic.bufferRegistry.has(soundAlias)) {
            await this.load(soundAlias);
        }
        const { channel = this.defaultChannelAlias, ...options } = paramOptions ?? {};
        return await this.findChannel(channel).play(mediaAlias, soundAlias, options);
    }

    async playTransient(
        alias: string,
        options?: SoundPlayOptionsWithChannel,
    ): Promise<IMediaInstance> {
        if (!SoundManagerStatic.bufferRegistry.has(alias)) {
            await this.load(alias);
        }
        const { channel = this.defaultChannelAlias, ...channelOptions } = options ?? {};
        return await this.findChannel(channel).playTransient(alias, channelOptions);
    }

    find(alias: string): IMediaInstance | undefined {
        return SoundManagerStatic.mediaInstances.get(alias)?.instance;
    }

    stop(alias: string): void {
        const mediaInstance = this.find(alias);
        if (mediaInstance) {
            mediaInstance.stop();
            SoundManagerStatic.mediaInstances.delete(alias);
        } else {
            logger.warn(`No media instance found with alias ${alias} to stop.`);
        }
    }

    pause(alias: string): IMediaInstance | undefined {
        const mediaInstance = this.find(alias);
        if (!mediaInstance) {
            logger.warn(`No media instance found with alias ${alias} to pause.`);
            return;
        }
        mediaInstance.paused = true;
        return mediaInstance;
    }

    resume(alias: string): IMediaInstance | undefined {
        const mediaInstance = this.find(alias);
        if (!mediaInstance) {
            logger.warn(`No media instance found with alias ${alias} to resume.`);
            return;
        }
        mediaInstance.paused = false;
        return mediaInstance;
    }

    duration(alias: string): number {
        const buffer = SoundManagerStatic.bufferRegistry.get(alias);
        return buffer?.duration ?? 0;
    }

    // ------------------------------------------------------------------ //
    // Loading                                                              //
    // ------------------------------------------------------------------ //

    async load(alias: string | string[]): Promise<void> {
        if (typeof alias === "string") {
            alias = [alias];
        }
        const promises = alias.map(async (a) => {
            if (SoundManagerStatic.bufferRegistry.has(a)) return;
            // Resolve via PIXI.Assets when the alias has been registered
            // there; fall back to using the alias as a raw URL.
            let url: string = a;
            try {
                const resolved = PIXI.Assets.resolver.resolve(a);
                if (resolved?.src) url = resolved.src;
            } catch {
                // Not registered in PIXI.Assets — use alias as URL.
            }
            try {
                // Load the raw AudioBuffer, then wrap it in a ToneAudioBuffer.
                // Using the static ToneAudioBuffer.load() + try/catch instead of
                // the constructor avoids an unhandled-rejection timing issue that
                // occurs when loading invalid URLs in test environments.
                const audioBuffer = await Tone.ToneAudioBuffer.load(url);
                const buffer = new Tone.ToneAudioBuffer(audioBuffer as unknown as AudioBuffer);
                SoundManagerStatic.bufferRegistry.set(a, buffer);
            } catch (e) {
                logger.warn(
                    `Failed to load audio buffer for "${a}" (url: "${url}"): ${e instanceof Error ? e.message : e}`,
                );
                // Register an empty stub so downstream code can proceed
                // without crashing (e.g. in test / headless environments).
                SoundManagerStatic.bufferRegistry.set(a, new Tone.ToneAudioBuffer());
            }
        });
        await Promise.all(promises);
    }

    backgroundLoad(alias: string | string[]): Promise<void> {
        // Fire-and-forget: load the buffer(s) without blocking the caller.
        return this.load(alias).catch((e) => {
            logger.error("Error background-loading sound", e);
        });
    }

    backgroundLoadBundle(alias: string): Promise<void> {
        const promise = PIXI.Assets.backgroundLoadBundle(alias);
        promise
            .then(async () => {
                try {
                    const assets = await PIXI.Assets.loadBundle(alias);
                    const loadPromises: Promise<void>[] = [];
                    for (const key in assets) {
                        if (!SoundManagerStatic.bufferRegistry.has(key)) {
                            loadPromises.push(this.load(key));
                        }
                    }
                    await Promise.all(loadPromises);
                } catch (e) {
                    logger.error("Error loading sound bundle", e);
                }
            })
            .catch((e) => {
                logger.error("Error background-loading sound bundle", e);
            });
        return promise;
    }

    clear() {
        this.stopAll();
    }

    // ------------------------------------------------------------------ //
    // Channels                                                             //
    // ------------------------------------------------------------------ //

    addChannel(
        alias: string | string[],
        options: ChannelOptions = {},
    ): AudioChannelInterface | undefined {
        if (typeof alias !== "string") {
            alias.forEach((a) => {
                const perChannelOptions: ChannelOptions = {
                    ...options,
                    filters: options.filters ? [...options.filters] : options.filters,
                };
                this.addChannel(a, perChannelOptions);
            });
            return;
        }
        if (SoundManagerStatic.channels.has(alias)) {
            logger.warn(`Channel with alias ${alias} already exists.`);
            return;
        }
        const channel = new AudioChannel(alias, options);
        SoundManagerStatic.channels.set(alias, channel);
        return channel;
    }

    findChannel(alias: string): AudioChannelInterface {
        const channel = SoundManagerStatic.channels.get(alias);
        if (!channel) {
            return this.addChannel(alias) as AudioChannelInterface;
        }
        return channel;
    }

    get channels(): AudioChannelInterface[] {
        return Array.from(SoundManagerStatic.channels.values());
    }

    // ------------------------------------------------------------------ //
    // Export / restore                                                     //
    // ------------------------------------------------------------------ //

    public export(): SoundGameState {
        const mediaInstances: {
            [key: string]: {
                channelAlias: string;
                soundAlias: string;
                stepCounter: number;
                options: Omit<SoundPlayOptions, "filters"> & { filters?: SoundFilterMemory[] };
            };
        } = Array.from(SoundManagerStatic.mediaInstances.entries()).reduce(
            (result, [mediaAlias, mediaInstance]) => {
                result[mediaAlias] = {
                    channelAlias: mediaInstance.channelAlias,
                    soundAlias: mediaInstance.soundAlias,
                    stepCounter: mediaInstance.stepCounter,
                    options: {
                        ...mediaInstance.options,
                        filters: FilterToFilterMemory(mediaInstance.options.filters),
                    },
                };
                return result;
            },
            {} as {
                [key: string]: {
                    channelAlias: string;
                    soundAlias: string;
                    stepCounter: number;
                    options: Omit<SoundPlayOptions, "filters"> & { filters?: SoundFilterMemory[] };
                };
            },
        );
        return {
            mediaInstances: createExportableElement(mediaInstances),
            filters: createExportableElement(FilterToFilterMemory(this.filtersAll)),
        };
    }

    async restore(data: object) {
        try {
            if (Object.hasOwn(data, "soundsPlaying")) {
                const soundsPlaying = (data as SoundGameState).soundsPlaying;
                if (soundsPlaying) {
                    const promises = Object.keys(soundsPlaying).map(async (alias) => {
                        await this.load(alias);
                        await this.play(alias);
                    });
                    await Promise.all(promises);
                }
            }

            if (Object.hasOwn(data, "mediaInstances")) {
                const mediaInstances = (data as SoundGameState).mediaInstances;
                if (mediaInstances) {
                    const usedChannels = new Set<string>();
                    const promises = Object.values(mediaInstances).map(
                        async ({ soundAlias, channelAlias }) => {
                            usedChannels.add(channelAlias);
                            return await this.load(soundAlias);
                        },
                    );
                    await Promise.all(promises);
                    this.channels.forEach((channel) => {
                        if (!channel.background || !usedChannels.has(channel.alias)) {
                            channel.stopAll();
                        }
                    });
                    const promises2 = Object.keys(mediaInstances).map(async (mediaAlias) => {
                        const mediaInstanceData = mediaInstances[mediaAlias];
                        const channel = this.findChannel(mediaInstanceData.channelAlias);
                        const restoredPaused =
                            mediaInstanceData.options.paused ?? mediaInstanceData.paused ?? false;
                        if (!channel.background) {
                            await channel.play(mediaAlias, mediaInstanceData.soundAlias, {
                                ...mediaInstanceData.options,
                                paused: restoredPaused,
                                filters: FilterMemoryToFilter(
                                    mediaInstanceData.options.filters || [],
                                ),
                            });
                        } else if (
                            mediaInstanceData.stepCounter === GameUnifier.stepCounter ||
                            !this.find(mediaAlias)
                        ) {
                            await channel.play(mediaAlias, mediaInstanceData.soundAlias, {
                                ...mediaInstanceData.options,
                                paused: restoredPaused,
                                filters: FilterMemoryToFilter(
                                    mediaInstanceData.options.filters || [],
                                ),
                            });
                        } else {
                            const mediaInstance = SoundManagerStatic.mediaInstances.get(mediaAlias);
                            if (!mediaInstance) {
                                logger.warn(
                                    `No media instance found with alias ${mediaAlias} while restoring background state.`,
                                );
                                return;
                            }
                            const instance = mediaInstance.instance;
                            if (instance.paused !== restoredPaused) {
                                instance.paused = restoredPaused;
                            }
                            if (instance.loop !== (mediaInstanceData.options.loop || false)) {
                                instance.loop = mediaInstanceData.options.loop || false;
                            }
                            if (instance.volume !== (mediaInstanceData.options.volume ?? 1)) {
                                instance.volume = mediaInstanceData.options.volume ?? 1;
                            }
                            if (instance.muted !== (mediaInstanceData.options.muted || false)) {
                                instance.muted = mediaInstanceData.options.muted || false;
                            }
                            if (instance.speed !== (mediaInstanceData.options.speed ?? 1)) {
                                instance.speed = mediaInstanceData.options.speed ?? 1;
                            }
                            mediaInstance.options = {
                                ...mediaInstanceData.options,
                                paused: restoredPaused,
                                filters: FilterMemoryToFilter(
                                    mediaInstanceData.options.filters || [],
                                ),
                            };
                        }
                    });
                    await Promise.all(promises2);
                }
            }

            if (Object.hasOwn(data, "filters")) {
                const f = (data as SoundGameState).filters;
                if (f) {
                    this.filtersAll = FilterMemoryToFilter(f);
                }
            }
        } catch (e) {
            logger.error("Error importing data", e);
        }
    }
}
