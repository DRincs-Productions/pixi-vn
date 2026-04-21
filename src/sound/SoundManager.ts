import { GENERAL_CHANNEL } from "@constants";
import { GameUnifier } from "@drincs/pixi-vn/core";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { type Filter, filters, type IMediaContext, Sound, sound } from "@pixi/sound";
import AudioChannel from "@sound/classes/AudioChannel";
import { FilterMemoryToFilter, FilterToFilterMemory } from "@sound/functions/sound-utility";
import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
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
    get context(): IMediaContext {
        return sound.context;
    }
    get filtersAll(): Filter[] {
        return sound.filtersAll;
    }
    set filtersAll(filtersAll: Filter[]) {
        sound.filtersAll = filtersAll.filter((f) => {
            return !(f instanceof filters.Filter);
        });
    }
    get supported(): boolean {
        return sound.supported;
    }

    _defaultChannelAlias = GENERAL_CHANNEL;
    get defaultChannelAlias(): string {
        return this._defaultChannelAlias;
    }
    set defaultChannelAlias(alias: string) {
        this._defaultChannelAlias = alias;
    }

    add(alias: string, sourceOptions: string) {
        return sound.add(alias, sourceOptions);
    }
    async edit(alias: string, options: SoundOptions): Promise<void> {
        let s = sound.find(alias);
        if (!s) {
            await this.load(alias);
            s = sound.find(alias);
            if (!s) {
                logger.error(`Sound with alias ${alias} not found after loading.`);
                return;
            }
        }
        s.options = options;
    }
    get useLegacy(): boolean {
        return sound.useLegacy;
    }
    set useLegacy(legacy: boolean) {
        sound.useLegacy = legacy;
    }
    get disableAutoPause(): boolean {
        return sound.disableAutoPause;
    }
    set disableAutoPause(autoPause: boolean) {
        sound.disableAutoPause = autoPause;
    }
    get volumeAll(): number {
        return sound.volumeAll;
    }
    set volumeAll(volume: number) {
        sound.volumeAll = volume;
    }
    get speedAll(): number {
        return sound.speedAll;
    }
    set speedAll(speed: number) {
        sound.speedAll = speed;
    }
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
        return sound.toggleMuteAll();
    }
    muteAll(): this {
        sound.muteAll();
        return this;
    }
    unmuteAll(): this {
        sound.unmuteAll();
        return this;
    }
    stopAll(): this {
        SoundManagerStatic.mediaInstances.clear();
        sound.stopAll();
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
        return sound.isPlaying();
    }
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
        if (!sound.exists(soundAlias)) {
            await this.load(soundAlias);
        }
        const { channel = this.defaultChannelAlias, ...options } = paramOptions ?? {};
        return await this.findChannel(channel).play(mediaAlias, soundAlias, options);
    }
    async playTransient(
        alias: string,
        options?: SoundPlayOptionsWithChannel,
    ): Promise<IMediaInstance> {
        if (!sound.exists(alias)) {
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
        return sound.duration(alias);
    }
    async load(alias: string | string[]): Promise<Sound[]> {
        if (typeof alias === "string") {
            alias = [alias];
        }
        const promises = alias.map(async (alias) => {
            const item = await PIXI.Assets.load<Sound>(alias);
            if (!sound.exists(alias)) sound.add(alias, item);
            return item;
        });
        return await Promise.all(promises);
    }
    backgroundLoad(alias: string | string[]): Promise<void> {
        const promise = PIXI.Assets.backgroundLoad(alias);

        promise.then(() => {
            if (typeof alias === "string") {
                alias = [alias];
            }
            alias.forEach((alias) => {
                const item = PIXI.Assets.get<Sound>(alias);
                if (!sound.exists(alias)) sound.add(alias, item);
            });
        });
        return promise;
    }
    backgroundLoadBundle(alias: string): Promise<void> {
        const promise = PIXI.Assets.backgroundLoadBundle(alias);
        promise.then(async () => {
            try {
                const assets = await PIXI.Assets.loadBundle(alias);
                for (const key in assets) {
                    const item = assets[key];
                    if (item instanceof Sound) {
                        if (!sound.exists(key)) sound.add(key, item);
                    }
                }
            } catch (e) {
                logger.error("Error loading sound bundle", e);
            }
        });
        return promise;
    }

    clear() {
        this.stopAll();
    }

    /* Channel Methods */

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

    /* Export and Import Methods */

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
                    // load all media first
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
                        if (!channel.background) {
                            await channel.play(mediaAlias, mediaInstanceData.soundAlias, {
                                ...mediaInstanceData.options,
                                paused:
                                    mediaInstanceData.options.paused || mediaInstanceData.paused,
                                filters: FilterMemoryToFilter(
                                    mediaInstanceData.options.filters || [],
                                ),
                            });
                        } else if (
                            mediaInstanceData.stepCounter === GameUnifier.stepCounter ||
                            !this.find(mediaAlias)
                        ) {
                            // if the channel is background, we only restore it if it was played in the current step, to avoid restoring background music that was playing in a previous step
                            await channel.play(mediaAlias, mediaInstanceData.soundAlias, {
                                ...mediaInstanceData.options,
                                paused:
                                    mediaInstanceData.options.paused || mediaInstanceData.paused,
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
                            if (
                                instance.paused !==
                                (mediaInstanceData.paused || mediaInstanceData.options.paused)
                            ) {
                                instance.paused =
                                    mediaInstanceData.paused ||
                                    mediaInstanceData.options.paused ||
                                    false;
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
                                paused:
                                    mediaInstanceData.options.paused || mediaInstanceData.paused,
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
