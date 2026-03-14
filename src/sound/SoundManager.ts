import { GameUnifier, PixiError } from "@drincs/pixi-vn/core";
import { Filter, filters, IMediaContext, IMediaInstance, Sound as PixiSound, sound } from "@pixi/sound";
import { createExportableElement } from "../utils";
import { logger } from "../utils/log-utility";
import Sound from "./classes/Sound";
import { FilterMemoryToFilter, FilterToFilterMemory } from "./functions/sound-utility";
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

    /**
     * https://github.com/pixijs/sound/blob/main/src/SoundLibrary.ts#L187
     */
    private getOptions(
        source: string | ArrayBuffer | AudioBuffer | HTMLAudioElement | SoundOptions,
        overrides?: SoundOptions,
    ): SoundOptions {
        let options: SoundOptions;

        if (typeof source === "string") {
            options = { url: source };
        } else if (Array.isArray(source)) {
            options = { url: source };
        } else if (
            source instanceof ArrayBuffer ||
            source instanceof AudioBuffer ||
            source instanceof HTMLAudioElement
        ) {
            options = { source } as any;
        } else {
            options = source as SoundOptions;
        }
        options = { ...options, ...(overrides || {}) };

        return options;
    }
    add(alias: string, sourceOptions: SoundOptions | string): Sound {
        if (this.exists(alias)) {
            this.remove(alias);
        }

        if (sourceOptions instanceof PixiSound) {
            sourceOptions = sourceOptions.options;
        }
        let s: Sound;
        if (sourceOptions instanceof Sound) {
            s = sourceOptions;
        } else {
            let options: SoundOptions = this.getOptions(sourceOptions || {});
            s = Sound.from(options);
        }
        s.alias = alias;

        !SoundManagerStatic.soundAliasesOrder.includes(alias) && SoundManagerStatic.soundAliasesOrder.push(alias);
        SoundManagerStatic.sounds[alias] = s;
        sound.add(alias, s);
        return s;
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
        SoundManagerStatic.soundAliasesOrder = SoundManagerStatic.soundAliasesOrder.filter((t) => t !== alias);
        delete SoundManagerStatic.soundsPlaying[alias];
        delete SoundManagerStatic.sounds[alias];
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
        SoundManagerStatic.soundAliasesOrder = [];
        SoundManagerStatic.soundsPlaying = {};
        SoundManagerStatic.sounds = {};
        return sound.removeAll();
    }
    stopAll() {
        for (let alias in SoundManagerStatic.sounds) {
            SoundManagerStatic.sounds[alias].stop();
        }
        SoundManagerStatic.soundsPlaying = {};
        return sound.stopAll();
    }
    exists(alias: string, assert?: boolean): boolean {
        return sound.exists(alias, assert) || alias in SoundManagerStatic.sounds;
    }
    isPlaying(): boolean {
        return sound.isPlaying();
    }
    find(alias: string): Sound {
        let item = SoundManagerStatic.sounds[alias];
        if (item) {
            return item;
        }
        item = sound.find(alias);
        if (item) {
            SoundManagerStatic.sounds[alias] = item;
        }
        return item;
    }
    play(alias: string, options?: SoundPlayOptions | string): IMediaInstance | Promise<IMediaInstance> {
        if (!this.exists(alias)) {
            throw new PixiError("unknown_element", "The alias is not found in the sound library.");
        }
        SoundManagerStatic.soundsPlaying[alias] = {
            stepIndex: GameUnifier.stepCounter,
            options: options,
            paused: false,
        };
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
