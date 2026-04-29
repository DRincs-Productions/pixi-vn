import { GENERAL_CHANNEL } from "@constants";
import { GameUnifier, PixiError } from "@drincs/pixi-vn/core";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import AudioChannel from "@sound/classes/AudioChannel";
import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type MediaInterface from "@sound/interfaces/MediaInterface";
import type { MediaMemory } from "@sound/interfaces/MediaInterface";
import type SoundGameState from "@sound/interfaces/SoundGameState";
import type SoundManagerInterface from "@sound/interfaces/SoundManagerInterface";
import type { ChannelOptions, SoundPlayOptionsWithChannel } from "@sound/interfaces/SoundOptions";
import SoundRegistry from "@sound/SoundRegistry";
import {
    FilterMemoryToFilter,
    FilterToFilterMemory,
    type SoundFilterMemory,
} from "@sound/utils/filter-utility";
import { decibelsToLinear, linearToDecibels, soundLoad } from "@sound/utils/sound-utility";
import { createExportableElement } from "@utils/export-utility";
import { logger } from "@utils/log-utility";
import * as Tone from "tone";

export default class SoundManager implements SoundManagerInterface {
    get volumeAll(): number {
        return decibelsToLinear(Tone.getDestination().volume.value);
    }
    set volumeAll(volume: number) {
        Tone.getDestination().volume.value = linearToDecibels(volume);
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
        for (const [alias, mediaInstance] of SoundRegistry.mediaInstances.entries()) {
            if (channel && mediaInstance.channelAlias !== channel) {
                continue;
            }
            if (!mediaInstance.paused) {
                mediaInstance.paused = true;
                SoundRegistry.systemPausedAliases.add(alias);
            }
        }
        if (!channel) {
            for (const player of SoundRegistry.transients) {
                player.stop();
            }
            SoundRegistry.transients.clear();
        }
        return this;
    }
    resumeUnsavedAll(channel?: string): this {
        const toResume: string[] = [];
        for (const alias of SoundRegistry.systemPausedAliases) {
            const mediaInstance = SoundRegistry.mediaInstances.get(alias);
            if (!mediaInstance) {
                toResume.push(alias);
                continue;
            }
            if (channel && mediaInstance.channelAlias !== channel) {
                continue;
            }
            mediaInstance.paused = false;
            toResume.push(alias);
        }
        for (const alias of toResume) {
            SoundRegistry.systemPausedAliases.delete(alias);
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

    async play(alias: string, options?: SoundPlayOptionsWithChannel): Promise<MediaInterface>;
    async play(
        mediaAlias: string,
        soundAlias: string,
        options?: SoundPlayOptionsWithChannel,
    ): Promise<MediaInterface>;
    async play(
        aliasOrMediaAlias: string,
        soundAliasOrOptions?: string | SoundPlayOptionsWithChannel,
        paramOptions?: SoundPlayOptionsWithChannel,
    ): Promise<MediaInterface> {
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
        SoundRegistry.transients.add(player);
        player.onstop = () => {
            player.dispose();
            SoundRegistry.transients.delete(player);
        };
        return player;
    }

    find(alias: string): MediaInterface | undefined {
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

    pause(alias: string): MediaInterface | undefined {
        const mediaInstance = this.find(alias);
        if (!mediaInstance) {
            logger.warn(`No media instance found with alias ${alias} to pause.`);
            return;
        }
        mediaInstance.paused = true;
        return mediaInstance;
    }

    resume(alias: string): MediaInterface | undefined {
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
                paused: boolean;
                options: MediaMemory & { filters?: SoundFilterMemory[]; delay?: number };
            };
        } = Array.from(SoundRegistry.mediaInstances.entries()).reduce(
            (result, [mediaAlias, mediaInstance]) => {
                result[mediaAlias] = {
                    channelAlias: mediaInstance.channelAlias,
                    soundAlias: mediaInstance.soundAlias,
                    stepCounter: mediaInstance.stepCounter,
                    paused: mediaInstance.paused,
                    options: {
                        ...mediaInstance.memory,
                        filters: FilterToFilterMemory(mediaInstance.filters),
                    },
                };
                return result;
            },
            {} as {
                [key: string]: {
                    channelAlias: string;
                    soundAlias: string;
                    stepCounter: number;
                    paused: boolean;
                    options: MediaMemory & { filters?: SoundFilterMemory[] };
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
                            const mediaInstance = await channel.play(
                                mediaAlias,
                                mediaInstanceData.soundAlias,
                                {
                                    ...mediaInstanceData.options,
                                    autostart: !restoredPaused,
                                    filters: FilterMemoryToFilter(
                                        mediaInstanceData.options.filters || [],
                                    ),
                                    delay: mediaInstanceData.options.delay,
                                },
                            );
                            mediaInstance.paused = restoredPaused;
                        } else if (
                            mediaInstanceData.stepCounter === GameUnifier.stepCounter ||
                            !this.find(mediaAlias)
                        ) {
                            const mediaInstance = await channel.play(
                                mediaAlias,
                                mediaInstanceData.soundAlias,
                                {
                                    ...mediaInstanceData.options,
                                    autostart: !restoredPaused,
                                    filters: FilterMemoryToFilter(
                                        mediaInstanceData.options.filters || [],
                                    ),
                                    delay: mediaInstanceData.options.delay,
                                },
                            );
                            mediaInstance.paused = restoredPaused;
                        } else {
                            const mediaInstance = SoundRegistry.mediaInstances.get(mediaAlias);
                            if (!mediaInstance) {
                                logger.warn(
                                    `No media instance found with alias ${mediaAlias} while restoring background state.`,
                                );
                                return;
                            }
                            mediaInstance.memory = {
                                ...mediaInstanceData.options,
                                paused: restoredPaused,
                            };
                            mediaInstance.filters.forEach((filter) => {
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
