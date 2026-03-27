import { GameUnifier } from "@drincs/pixi-vn/core";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { Filter, filters, IMediaContext, Sound, sound } from "@pixi/sound";
import { GENERAL_CHANNEL } from "../constants";
import { createExportableElement } from "../utils";
import { logger } from "../utils/log-utility";
import AudioChannel from "./classes/AudioChannel";
import { FilterMemoryToFilter, FilterToFilterMemory } from "./functions/sound-utility";
import AudioChannelInterface from "./interfaces/AudioChannelInterface";
import IMediaInstance from "./interfaces/IMediaInstance";
import SoundGameState from "./interfaces/SoundGameState";
import SoundManagerInterface from "./interfaces/SoundManagerInterface";
import SoundOptions, { ChannelOptions, SoundPlayOptions, SoundPlayOptionsWithChannel } from "./interfaces/SoundOptions";
import SoundManagerStatic from "./SoundManagerStatic";
import SoundFilterMemory from "./types/SoundFilterMemory";

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
    togglePauseAll(): boolean {
        return sound.togglePauseAll();
    }
    pauseAll() {
        return sound.pauseAll();
    }
    resumeAll() {
        return sound.resumeAll();
    }
    toggleMuteAll(): boolean {
        return sound.toggleMuteAll();
    }
    muteAll() {
        return sound.muteAll();
    }
    unmuteAll() {
        return sound.unmuteAll();
    }
    removeAll() {
        return sound.removeAll();
    }
    stopAll() {
        SoundManagerStatic.mediaInstances = {};
        return sound.stopAll();
    }
    isPlaying(): boolean {
        return sound.isPlaying();
    }
    async play(alias: string, options?: SoundPlayOptions): Promise<IMediaInstance>;
    async play(mediaAlias: string, soundAlias: string, options?: SoundPlayOptions): Promise<IMediaInstance>;
    async play(
        aliasOrMediaAlias: string,
        soundAliasOrOptions?: string | SoundPlayOptionsWithChannel,
        options?: SoundPlayOptionsWithChannel,
    ): Promise<IMediaInstance> {
        let mediaAlias: string;
        let soundAlias: string;
        if (typeof soundAliasOrOptions === "string") {
            mediaAlias = aliasOrMediaAlias;
            soundAlias = soundAliasOrOptions;
        } else {
            mediaAlias = aliasOrMediaAlias;
            soundAlias = aliasOrMediaAlias;
            options = soundAliasOrOptions;
        }
        const channelAlias = options?.channel || this.defaultChannelAlias;
        return await this.findChannel(channelAlias).play(mediaAlias, soundAlias, options);
    }
    find(alias: string): IMediaInstance | undefined {
        return SoundManagerStatic.mediaInstances[alias]?.instance;
    }
    stop(alias: string): void {
        const mediaInstance = this.find(alias);
        if (mediaInstance) {
            mediaInstance.stop();
            delete SoundManagerStatic.mediaInstances[alias];
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
    async load(alias: string | string[]): Promise<void> {
        await PIXI.Assets.load(alias);
        if (typeof alias === "string") {
            alias = [alias];
        }
        alias.forEach((alias) => {
            const item = PIXI.Assets.get<Sound>(alias);
            if (!sound.find(alias)) sound.add(alias, item);
        });
    }
    backgroundLoad(alias: string | string[]): Promise<void> {
        const promise = PIXI.Assets.backgroundLoad(alias);

        promise.then(() => {
            if (typeof alias === "string") {
                alias = [alias];
            }
            alias.forEach((alias) => {
                const item = PIXI.Assets.get<Sound>(alias);
                if (!sound.find(alias)) sound.add(alias, item);
            });
        });
        return promise;
    }
    backgroundLoadBundle(alias: string): Promise<void> {
        const promise = PIXI.Assets.backgroundLoadBundle(alias);
        promise.then(async () => {
            try {
                const assets = await PIXI.Assets.loadBundle(alias);
                for (let key in assets) {
                    const item = assets[key];
                    if (item instanceof Sound) {
                        if (!sound.find(key)) sound.add(key, item);
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

    addChannel(alias: string | string[], options: ChannelOptions = {}): AudioChannelInterface | undefined {
        if (typeof alias !== "string") {
            alias.forEach((alias) => {
                this.addChannel(alias, options);
            });
            return;
        }
        if (SoundManagerStatic.channels[alias]) {
            logger.warn(`Channel with alias ${alias} already exists.`);
            return;
        }
        const channel = new AudioChannel(alias, options);
        SoundManagerStatic.channels[alias] = channel;
        return channel;
    }

    findChannel(alias: string): AudioChannelInterface {
        const channel = SoundManagerStatic.channels[alias];
        if (!channel) {
            return this.addChannel(alias) as AudioChannelInterface;
        }
        return channel;
    }

    get channels(): AudioChannelInterface[] {
        return Object.values(SoundManagerStatic.channels);
    }

    /* Export and Import Methods */

    public export(): SoundGameState {
        let mediaInstances: {
            [key: string]: {
                channelAlias: string;
                soundAlias: string;
                stepCounter: number;
                options: Omit<SoundPlayOptions, "filters"> & { filters?: SoundFilterMemory[] };
            };
        } = Object.values(SoundManagerStatic.mediaInstances).reduce(
            (acc, mediaInstance) => {
                acc[mediaInstance.soundAlias] = {
                    channelAlias: mediaInstance.channelAlias,
                    soundAlias: mediaInstance.soundAlias,
                    stepCounter: GameUnifier.stepCounter,
                    options: { ...mediaInstance.options, filters: FilterToFilterMemory(mediaInstance.options.filters) },
                };
                return acc;
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
            if (data.hasOwnProperty("soundsPlaying")) {
                let soundsPlaying = (data as SoundGameState)["soundsPlaying"];
                if (soundsPlaying) {
                    const promises = Object.keys(soundsPlaying).map(async (alias) => {
                        await this.load(alias);

                        await this.play(alias);
                    });
                    await Promise.all(promises);
                }
            }

            if (data.hasOwnProperty("mediaInstances")) {
                let mediaInstances = (data as SoundGameState)["mediaInstances"];
                if (mediaInstances) {
                    // load all media first
                    const usedChannels = new Set<string>();
                    const promises = Object.values(mediaInstances).map(async ({ soundAlias, channelAlias }) => {
                        usedChannels.add(channelAlias);
                        return await this.load(soundAlias);
                    });
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
                                filters: FilterMemoryToFilter(mediaInstanceData.options.filters || []),
                            });
                        } else if (mediaInstanceData.stepCounter === GameUnifier.stepCounter) {
                            // if the channel is background, we only restore it if it was played in the current step, to avoid restoring background music that was playing in a previous step
                            await channel.play(mediaAlias, mediaInstanceData.soundAlias, {
                                ...mediaInstanceData.options,
                                filters: FilterMemoryToFilter(mediaInstanceData.options.filters || []),
                            });
                        }
                    });
                    await Promise.all(promises2);
                }
            }

            if (data.hasOwnProperty("filters")) {
                let f = (data as SoundGameState)["filters"];
                if (f) {
                    this.filtersAll = FilterMemoryToFilter(f);
                }
            }
        } catch (e) {
            logger.error("Error importing data", e);
        }
    }
}
