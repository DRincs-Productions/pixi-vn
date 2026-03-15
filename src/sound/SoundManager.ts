import { GameUnifier, PixiError } from "@drincs/pixi-vn/core";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { Filter, filters, IMediaContext, sound } from "@pixi/sound";
import { createExportableElement } from "../utils";
import { logger } from "../utils/log-utility";
import Sound from "./classes/Sound";
import { FilterMemoryToFilter, FilterToFilterMemory } from "./functions/sound-utility";
import AudioChannelInterface from "./interfaces/AudioChannelInterface";
import SoundGameState, { ExportedSoundPlay } from "./interfaces/SoundGameState";
import SoundManagerInterface from "./interfaces/SoundManagerInterface";
import SoundOptions, { SoundPlayOptions } from "./interfaces/SoundOptions";
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

    add(alias: string, sourceOptions: SoundOptions | string) {
        return sound.add(alias, sourceOptions);
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
    remove(alias: string) {
        return sound.remove(alias);
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
        for (let alias in SoundManagerStatic.sounds) {
            SoundManagerStatic.sounds[alias].stop();
        }
        SoundManagerStatic.soundsPlaying = {};
        return sound.stopAll();
    }
    exists(alias: string): boolean {
        return PIXI.Assets.resolver.hasKey(alias);
    }
    isPlaying(): boolean {
        return sound.isPlaying();
    }
    find(alias: string): Sound {
        return PIXI.Assets.get<Sound>(alias) || sound.find(alias);
    }
    async play(alias: string, options?: SoundPlayOptions): Promise<AudioChannelInterface> {
        if (!this.exists(alias)) {
            throw new PixiError("unknown_element", "The alias is not found in the sound library.");
        }
        try {
            const item = await PIXI.Assets.load<Sound>(alias);
            sound.add(alias, item);
        } catch (e) {
            logger.error("Error loading sound", e);
            throw new PixiError("unknown_element", "The sound file could not be loaded.");
        }
        return sound.play(alias, options);
    }
    stop(alias: string): Sound {
        delete SoundManagerStatic.soundsPlaying[alias];
        return sound.stop(alias);
    }
    pause(alias: string): Sound {
        let item = SoundManagerStatic.soundsPlaying[alias];
        if (!item) {
            throw new PixiError("unknown_element", "The alias is not found in the playInStepIndex.");
        }
        SoundManagerStatic.soundsPlaying[alias] = {
            ...item,
            paused: true,
        };
        return sound.pause(alias);
    }
    resume(alias: string): Sound {
        let item = SoundManagerStatic.soundsPlaying[alias];
        if (!item) {
            throw new PixiError("unknown_element", "The alias is not found in the playInStepIndex.");
        }
        SoundManagerStatic.soundsPlaying[alias] = {
            options: item.options,
            stepIndex: GameUnifier.stepCounter,
            paused: false,
        };
        return sound.resume(alias);
    }
    volume(alias: string, volume?: number): number {
        return sound.volume(alias, volume);
    }
    speed(alias: string, speed?: number): number {
        return sound.speed(alias, speed);
    }
    duration(alias: string): number {
        return sound.duration(alias);
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

    /* Export and Import Methods */

    public export(): SoundGameState {
        let soundElements: { [key: string]: ExportedSoundPlay } = {};
        for (let alias in SoundManagerStatic.soundsPlaying) {
            let sound = SoundManagerStatic.soundsPlaying[alias];
            let item = this.find(alias);
            if (item) {
                soundElements[alias] = {
                    ...sound,
                    sound: {
                        options: {
                            ...item.options,
                            autoPlay: item.autoPlay,
                            loop: item.loop,
                            preload: item.preload,
                            singleInstance: item.singleInstance,
                            url: item.options.url,
                            volume: item.options.volume,
                        },
                        filters: FilterToFilterMemory(item.media.filters),
                    },
                };
            }
        }
        return {
            soundsPlaying: createExportableElement(soundElements),
            soundAliasesOrder: createExportableElement(SoundManagerStatic.soundAliasesOrder),
            filters: createExportableElement(FilterToFilterMemory(this.filtersAll)),
        };
    }
    public removeOldSoundAndExport(): SoundGameState {
        // let soundAliasesOrder = []
        // for (let alias of GameSoundManager.soundAliasesOrder) {
        //     if (sound.exists(alias)) {
        //         let s = sound.find(alias)
        //         if (s.loop) {
        //             soundAliasesOrder.push(alias)
        //         }
        //     }
        // }
        // GameSoundManager.soundAliasesOrder = soundAliasesOrder
        return this.export();
    }
    public restore(data: object) {
        const stepCounter = GameUnifier.stepCounter - 1;
        this.clear();
        try {
            if (data.hasOwnProperty("soundAliasesOrder")) {
                SoundManagerStatic.soundAliasesOrder = (data as SoundGameState)["soundAliasesOrder"];
            } else {
                logger.error("The data does not have the properties soundAliasesOrder");
                return;
            }

            if (data.hasOwnProperty("filters")) {
                let f = (data as SoundGameState)["filters"];
                if (f) {
                    this.filtersAll = FilterMemoryToFilter(f);
                }
            }

            if (data.hasOwnProperty("playInStepIndex")) {
                let playInStepIndex = (data as SoundGameState)["playInStepIndex"];
                if (playInStepIndex) {
                    SoundManagerStatic.soundsPlaying = playInStepIndex;
                }
            }

            if (data.hasOwnProperty("sounds")) {
                let sounds = (data as SoundGameState)["sounds"];
                for (let alias in sounds) {
                    let item = sounds[alias];
                    let autoPlay = false;
                    let s = this.add(alias, {
                        ...item.options,
                        autoPlay: false,
                    });

                    if (alias in SoundManagerStatic.soundsPlaying) {
                        let step = SoundManagerStatic.soundsPlaying[alias];
                        if (
                            item.options.loop ||
                            (step.options && typeof step.options === "object" && step.options.loop)
                        ) {
                            autoPlay = true;
                        } else if (step.stepIndex === stepCounter) {
                            autoPlay = true;
                        }

                        if (item.filters) {
                            s.filters = FilterMemoryToFilter(item.filters);
                        }

                        if (autoPlay) {
                            s.play();
                        }
                    }
                }
            }

            if (data.hasOwnProperty("soundsPlaying")) {
                let soundsPlaying = (data as SoundGameState)["soundsPlaying"];
                for (let alias in soundsPlaying) {
                    let op = soundsPlaying[alias];
                    SoundManagerStatic.soundsPlaying[alias] = {
                        paused: op.paused,
                        stepIndex: op.stepIndex,
                        options: op.options,
                    };

                    let item = soundsPlaying[alias].sound;
                    let autoPlay = false;
                    let s: Sound;
                    if (this.exists(alias)) {
                        s = this.find(alias);
                        item.options.url = s.options.url;
                        item.options.volume = s.options.volume;
                        s.options = item.options;
                        s.autoPlay = false;
                        s.filters = item.filters ? FilterMemoryToFilter(item.filters) : [];
                    } else {
                        s = this.add(alias, {
                            ...item.options,
                            autoPlay: false,
                        });
                    }

                    if (alias in SoundManagerStatic.soundsPlaying) {
                        let step = SoundManagerStatic.soundsPlaying[alias];
                        if (
                            item.options.loop ||
                            (step.options && typeof step.options === "object" && step.options.loop)
                        ) {
                            autoPlay = true;
                        } else if (step.stepIndex === stepCounter) {
                            autoPlay = true;
                        }

                        if (item.filters) {
                            s.filters = FilterMemoryToFilter(item.filters);
                        }

                        if (autoPlay) {
                            s.play();
                        }
                    }
                }
            } else {
                logger.error("The data does not have the properties soundsPlaying");
                return;
            }
        } catch (e) {
            logger.error("Error importing data", e);
        }
    }
}
