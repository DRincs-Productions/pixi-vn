import { GENERAL_CHANNEL } from "@constants";
import { GameUnifier, PixiError } from "@drincs/pixi-vn/core";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import AudioChannel from "@sound/classes/AudioChannel";
import type MediaInstance from "@sound/classes/MediaInstance";
import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type MediaInteface from "@sound/interfaces/MediaInteface";
import type { MediaMemory } from "@sound/interfaces/MediaInteface";
import type SoundGameState from "@sound/interfaces/SoundGameState";
import type SoundManagerInterface from "@sound/interfaces/SoundManagerInterface";
import type {
    ChannelOptions,
    SoundPlayOptions,
    SoundPlayOptionsWithChannel,
} from "@sound/interfaces/SoundOptions";
import SoundRegistry from "@sound/SoundRegistry";
import {
    FilterMemoryToFilter,
    FilterToFilterMemory,
    type SoundFilterMemory,
} from "@sound/utils/filter-utility";
import { soundLoad } from "@sound/utils/sound-utility";
import { createExportableElement } from "@utils/export-utility";
import { logger } from "@utils/log-utility";
import * as Tone from "tone";

export default class SoundManager implements SoundManagerInterface {
    get volumeAll(): number {
        const db = Tone.getDestination().volume.value;
        if (db === -Infinity) return 0;
        return 10 ** (db / 20);
    }
    set volumeAll(volume: number) {
        Tone.getDestination().volume.value = volume <= 0 ? -Infinity : 20 * Math.log10(volume);
    }

    get speedAll(): number {
        return this._speedAll;
    }
    set speedAll(speed: number) {
        this._speedAll = speed;
        for (const mediaInstance of SoundRegistry.mediaInstances.values()) {
            mediaInstance.speed = speed;
        }
    }
    private _speedAll = 1;

    _defaultChannelAlias = GENERAL_CHANNEL;
    get defaultChannelAlias(): string {
        return this._defaultChannelAlias;
    }
    set defaultChannelAlias(alias: string) {
        this._defaultChannelAlias = alias;
    }

    /** @deprecated Register sound assets directly via `PIXI.Assets` instead. */
    add(alias: string, sourceOptions: string): void {
        if (!SoundRegistry.bufferRegistry.has(alias)) {
            const buffer = new Tone.ToneAudioBuffer(sourceOptions);
            SoundRegistry.bufferRegistry.set(alias, buffer);
        }
    }

    pauseAll(): this {
        for (const mediaInstance of SoundRegistry.mediaInstances.values()) {
            if (!mediaInstance.paused) {
                mediaInstance.paused = true;
            }
        }
        return this;
    }
    resumeAll(): this {
        for (const mediaInstance of SoundRegistry.mediaInstances.values()) {
            if (mediaInstance.paused) {
                mediaInstance.paused = false;
            }
        }
        return this;
    }
    get muted(): boolean {
        return Tone.getDestination().mute;
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
        for (const mediaInstance of SoundRegistry.mediaInstances.values()) {
            mediaInstance.stop();
        }
        SoundRegistry.mediaInstances.clear();
        return this;
    }
    pauseUnsavedAll(channel?: string): this {
        if (channel) {
            const toneChannel = (this.findChannel(channel) as AudioChannel).toneChannel;
            toneChannel.disconnect();
            toneChannel.connect(SoundRegistry.freezeBus);
        } else {
            for (const ch of SoundRegistry.channels.values()) {
                const toneChannel = (ch as AudioChannel).toneChannel;
                toneChannel.disconnect();
                toneChannel.connect(SoundRegistry.freezeBus);
            }
        }
        return this;
    }
    resumeUnsavedAll(channel?: string): this {
        if (channel) {
            const toneChannel = (this.findChannel(channel) as AudioChannel).toneChannel;
            toneChannel.disconnect();
            toneChannel.connect(SoundRegistry.liveBus);
        } else {
            for (const ch of SoundRegistry.channels.values()) {
                const toneChannel = (ch as AudioChannel).toneChannel;
                toneChannel.disconnect();
                toneChannel.connect(SoundRegistry.liveBus);
            }
        }
        return this;
    }
    stopTransientAll(): this {
        for (const player of SoundRegistry.transients) {
            player.stop();
        }
        SoundRegistry.transients.clear();
        return this;
    }

    async play(alias: string, options?: SoundPlayOptionsWithChannel): Promise<MediaInteface>;
    async play(
        mediaAlias: string,
        soundAlias: string,
        options?: SoundPlayOptionsWithChannel,
    ): Promise<MediaInteface>;
    async play(
        aliasOrMediaAlias: string,
        soundAliasOrOptions?: string | SoundPlayOptionsWithChannel,
        paramOptions?: SoundPlayOptionsWithChannel,
    ): Promise<MediaInteface> {
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
        if (!SoundRegistry.bufferRegistry.has(soundAlias)) {
            await this.load(soundAlias);
        }
        const { channel = this.defaultChannelAlias, ...options } = paramOptions ?? {};
        return await this.findChannel(channel).play(mediaAlias, soundAlias, options);
    }

    async playTransient(
        alias: string,
        options?: Partial<Tone.PlayerOptions>,
    ): Promise<Tone.Player> {
        if (!SoundRegistry.bufferRegistry.has(alias)) {
            await this.load(alias);
        }
        const buffer = SoundRegistry.bufferRegistry.get(alias);
        if (!buffer) {
            throw new PixiError(
                "unregistered_asset",
                `Sound buffer for alias "${alias}" is not loaded. Call sound.load() first.`,
            );
        }
        const { autostart = true, ...playerOptions } = options ?? {};
        const player = new Tone.Player({ ...playerOptions, url: buffer }).toDestination();
        if (autostart) {
            player.start();
        }
        return player;
    }

    find(alias: string): MediaInteface | undefined {
        return SoundRegistry.mediaInstances.get(alias);
    }

    stop(alias: string): void {
        const mediaInstance = this.find(alias);
        if (mediaInstance) {
            mediaInstance.stop();
            SoundRegistry.mediaInstances.delete(alias);
        } else {
            logger.warn(`No media instance found with alias ${alias} to stop.`);
        }
    }

    pause(alias: string): MediaInteface | undefined {
        const mediaInstance = this.find(alias);
        if (!mediaInstance) {
            logger.warn(`No media instance found with alias ${alias} to pause.`);
            return;
        }
        mediaInstance.paused = true;
        return mediaInstance;
    }

    resume(alias: string): MediaInteface | undefined {
        const mediaInstance = this.find(alias);
        if (!mediaInstance) {
            logger.warn(`No media instance found with alias ${alias} to resume.`);
            return;
        }
        mediaInstance.paused = false;
        return mediaInstance;
    }

    duration(alias: string): number {
        const buffer = SoundRegistry.bufferRegistry.get(alias);
        return buffer?.duration ?? 0;
    }

    async load(...alias: string[]): Promise<void> {
        const promises = alias.map(soundLoad);
        await Promise.all(promises);
    }

    backgroundLoad(...alias: string[]): Promise<void> {
        // Fire-and-forget: load the buffer(s) without blocking the caller.
        return this.load(...alias).catch((e) => {
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
                        if (!SoundRegistry.bufferRegistry.has(key)) {
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
        if (SoundRegistry.channels.has(alias)) {
            logger.warn(`Channel with alias ${alias} already exists.`);
            return;
        }
        const channel = new AudioChannel(alias, options);
        SoundRegistry.channels.set(alias, channel);
        return channel;
    }

    findChannel(alias: string): AudioChannelInterface {
        const channel = SoundRegistry.channels.get(alias);
        if (!channel) {
            return this.addChannel(alias) as AudioChannelInterface;
        }
        return channel;
    }

    get channels(): AudioChannelInterface[] {
        return Array.from(SoundRegistry.channels.values());
    }

    public export(): SoundGameState {
        const mediaInstances: {
            [key: string]: {
                channelAlias: string;
                soundAlias: string;
                stepCounter: number;
                options: Omit<SoundPlayOptions, "filters"> & { filters?: SoundFilterMemory[] };
            };
        } = Array.from(SoundRegistry.mediaInstances.entries()).reduce(
            (result, [mediaAlias, mediaInstance]) => {
                result[mediaAlias] = {
                    channelAlias: (mediaInstance as MediaInstance).channelAlias,
                    soundAlias: (mediaInstance as MediaInstance).soundAlias,
                    stepCounter: (mediaInstance as MediaInstance).stepCounter,
                    options: {
                        ...(mediaInstance as MediaInstance).memory,
                        filters: FilterToFilterMemory((mediaInstance as MediaInstance).filters),
                        delay: (mediaInstance as MediaInstance).delay,
                    },
                };
                return result;
            },
            {} as {
                [key: string]: {
                    channelAlias: string;
                    soundAlias: string;
                    stepCounter: number;
                    options: MediaMemory & { filters?: SoundFilterMemory[]; delay?: number };
                };
            },
        );
        return {
            mediaInstances: createExportableElement(mediaInstances),
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
                                delay: mediaInstanceData.options.delay,
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
                                delay: mediaInstanceData.options.delay,
                            });
                        } else {
                            const mediaInstance = SoundRegistry.mediaInstances.get(mediaAlias);
                            if (!mediaInstance) {
                                logger.warn(
                                    `No media instance found with alias ${mediaAlias} while restoring background state.`,
                                );
                                return;
                            }
                            if (mediaInstance.paused !== restoredPaused) {
                                mediaInstance.paused = restoredPaused;
                            }
                            if (mediaInstance.loop !== (mediaInstanceData.options.loop || false)) {
                                mediaInstance.loop = mediaInstanceData.options.loop || false;
                            }
                            if (
                                mediaInstance.volume.value !==
                                (mediaInstanceData.options.volume ?? 1)
                            ) {
                                mediaInstance.volume.value = mediaInstanceData.options.volume ?? 1;
                            }
                            if (
                                mediaInstance.muted !== (mediaInstanceData.options.muted || false)
                            ) {
                                mediaInstance.muted = mediaInstanceData.options.muted || false;
                            }
                            if (mediaInstance.speed !== (mediaInstanceData.options.speed ?? 1)) {
                                mediaInstance.speed = mediaInstanceData.options.speed ?? 1;
                            }
                            (mediaInstance as MediaInstance).filters.forEach((filter) => {
                                mediaInstance.disconnect(filter);
                            });
                            mediaInstance.chain(
                                ...FilterMemoryToFilter(mediaInstanceData.options.filters || []),
                            );
                        }
                    });
                    await Promise.all(promises2);
                }
            }
        } catch (e) {
            logger.error("Error importing data", e);
        }
    }
}
