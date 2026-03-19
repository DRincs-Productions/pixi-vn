import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { Filter, filters, IMediaContext, Sound, sound } from "@pixi/sound";
import { GENERAL_CHANNEL } from "../";
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
        const channelAlias = options?.channel || GENERAL_CHANNEL;
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
            sound.add(alias, item);
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
                sound.add(alias, item);
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
                        sound.add(key, item);
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
            alias.forEach((a) => {
                this.addChannel(a, options);
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
                options: SoundPlayOptions;
            };
        } = Object.values(SoundManagerStatic.mediaInstances).reduce(
            (acc, mediaInstance) => {
                acc[mediaInstance.soundAlias] = {
                    channelAlias: mediaInstance.channelAlias,
                    soundAlias: mediaInstance.soundAlias,
                    options: mediaInstance.options,
                };
                return acc;
            },
            {} as {
                [key: string]: {
                    channelAlias: string;
                    soundAlias: string;
                    options: SoundPlayOptions;
                };
            },
        );
        return {
            mediaInstances: createExportableElement(mediaInstances),
            filters: createExportableElement(FilterToFilterMemory(this.filtersAll)),
        };
    }
    async restore(data: object) {
        this.clear();
        try {
            if (data.hasOwnProperty("filters")) {
                let f = (data as SoundGameState)["filters"];
                if (f) {
                    this.filtersAll = FilterMemoryToFilter(f);
                }
            }

            if (data.hasOwnProperty("soundsPlaying")) {
                let soundsPlaying = (data as SoundGameState)["soundsPlaying"];
                if (soundsPlaying) {
                    const promises = Object.keys(soundsPlaying).map(async (alias) => {
                        await this.load(alias);

                        this.play(alias);
                    });
                    await Promise.all(promises);
                }
            }
        } catch (e) {
            logger.error("Error importing data", e);
        }
    }
}
