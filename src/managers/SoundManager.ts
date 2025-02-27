import {
    Filter,
    filters,
    IMediaContext,
    IMediaInstance,
    Sound as PixiSound,
    sound,
    SoundLibrary,
    SoundMap,
} from "@pixi/sound";
import { Sound } from "../classes";
import { logger } from "../functions/log-utility";
import { FilterMemoryToFilter, FilterToFilterMemory } from "../functions/sound-utility";
import { ExportedSounds, NarrationManagerInterface, SoundOptions, SoundPlayOptions } from "../interface";
import { ExportedSoundPlay } from "../interface/export/ExportedSounds";
import SoundManagerStatic from "./SoundManagerStatic";

export default class SoundManager extends SoundLibrary {
    constructor(private readonly narration: NarrationManagerInterface) {
        super();
    }
    override get context(): IMediaContext {
        return sound.context;
    }
    override get filtersAll(): Filter[] {
        return sound.filtersAll;
    }
    override set filtersAll(filtersAll: Filter[]) {
        sound.filtersAll = filtersAll.filter((f) => {
            return !(f instanceof filters.Filter);
        });
    }
    override get supported(): boolean {
        return sound.supported;
    }

    /**
     * https://github.com/pixijs/sound/blob/main/src/SoundLibrary.ts#L187
     */
    private getOptions(
        source: string | ArrayBuffer | AudioBuffer | HTMLAudioElement | SoundOptions,
        overrides?: SoundOptions
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
    override add(alias: string, options: SoundOptions | string): Sound;
    /**
     * @deprecated: Use `add(alias: string, options: Options | string | ArrayBuffer | AudioBuffer | HTMLAudioElement | Sound): Sound;` instead.
     */
    override add(map: any, globalOptions?: SoundOptions): SoundMap;
    public override add(alias: string, sourceOptions?: SoundOptions | string): Sound | SoundMap {
        if (typeof alias === "object") {
            throw new Error(
                "[Pixi’VN] The method add(map: SoundSourceMap, globalOptions?: Options) is deprecated. Use add(alias: string, options: Options | string | ArrayBuffer | AudioBuffer | HTMLAudioElement | Sound): Sound; instead."
            );
        }
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
    override get useLegacy(): boolean {
        return sound.useLegacy;
    }
    override set useLegacy(legacy: boolean) {
        sound.useLegacy = legacy;
    }
    override get disableAutoPause(): boolean {
        return sound.disableAutoPause;
    }
    override set disableAutoPause(autoPause: boolean) {
        sound.disableAutoPause = autoPause;
    }
    override remove(alias: string): this {
        SoundManagerStatic.soundAliasesOrder = SoundManagerStatic.soundAliasesOrder.filter((t) => t !== alias);
        delete SoundManagerStatic.soundsPlaying[alias];
        delete SoundManagerStatic.sounds[alias];
        return sound.remove(alias) as this;
    }
    override get volumeAll(): number {
        return sound.volumeAll;
    }
    override set volumeAll(volume: number) {
        sound.volumeAll = volume;
    }
    override get speedAll(): number {
        return sound.speedAll;
    }
    override set speedAll(speed: number) {
        sound.speedAll = speed;
    }
    override togglePauseAll(): boolean {
        return sound.togglePauseAll();
    }
    override pauseAll(): this {
        return sound.pauseAll() as this;
    }
    override resumeAll(): this {
        return sound.resumeAll() as this;
    }
    override toggleMuteAll(): boolean {
        return sound.toggleMuteAll();
    }
    override muteAll(): this {
        return sound.muteAll() as this;
    }
    override unmuteAll(): this {
        return sound.unmuteAll() as this;
    }
    override removeAll(): this {
        SoundManagerStatic.soundAliasesOrder = [];
        SoundManagerStatic.soundsPlaying = {};
        SoundManagerStatic.sounds = {};
        return sound.removeAll() as this;
    }
    override stopAll(): this {
        for (let alias in SoundManagerStatic.sounds) {
            SoundManagerStatic.sounds[alias].stop();
        }
        SoundManagerStatic.soundsPlaying = {};
        return sound.stopAll() as this;
    }
    override exists(alias: string, assert?: boolean): boolean {
        return sound.exists(alias, assert) || alias in SoundManagerStatic.sounds;
    }
    override isPlaying(): boolean {
        return sound.isPlaying();
    }
    override find(alias: string): Sound {
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
    override play(alias: string, options?: SoundPlayOptions | string): IMediaInstance | Promise<IMediaInstance> {
        if (!this.exists(alias)) {
            throw new Error("[Pixi’VN] The alias is not found in the sound library.");
        }
        SoundManagerStatic.soundsPlaying[alias] = {
            stepIndex: this.narration.lastStepIndex,
            options: options,
            paused: false,
        };
        return sound.play(alias, options);
    }
    override stop(alias: string): Sound {
        delete SoundManagerStatic.soundsPlaying[alias];
        return sound.stop(alias);
    }
    override pause(alias: string): Sound {
        let item = SoundManagerStatic.soundsPlaying[alias];
        if (!item) {
            throw new Error("[Pixi’VN] The alias is not found in the playInStepIndex.");
        }
        SoundManagerStatic.soundsPlaying[alias] = {
            ...item,
            paused: true,
        };
        return sound.pause(alias);
    }
    override resume(alias: string): Sound {
        let item = SoundManagerStatic.soundsPlaying[alias];
        if (!item) {
            throw new Error("[Pixi’VN] The alias is not found in the playInStepIndex.");
        }
        SoundManagerStatic.soundsPlaying[alias] = {
            options: item.options,
            stepIndex: this.narration.lastStepIndex,
            paused: false,
        };
        return sound.resume(alias);
    }
    override volume(alias: string, volume?: number): number {
        return sound.volume(alias, volume);
    }
    override speed(alias: string, speed?: number): number {
        return sound.speed(alias, speed);
    }
    override duration(alias: string): number {
        return sound.duration(alias);
    }
    override close(): this {
        return sound.close() as this;
    }

    clear() {
        this.stopAll();
    }

    /* Export and Import Methods */

    public exportJson(): string {
        return JSON.stringify(this.export());
    }
    public export(): ExportedSounds {
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
            soundsPlaying: soundElements,
            soundAliasesOrder: SoundManagerStatic.soundAliasesOrder,
            filters: FilterToFilterMemory(this.filtersAll),
        };
    }
    public removeOldSoundAndExport(): ExportedSounds {
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
    public importJson(dataString: string) {
        this.import(JSON.parse(dataString));
    }
    public import(data: object, lastStepIndex = this.narration.lastStepIndex) {
        this.clear();
        try {
            if (data.hasOwnProperty("soundAliasesOrder")) {
                SoundManagerStatic.soundAliasesOrder = (data as ExportedSounds)["soundAliasesOrder"];
            } else {
                logger.error("The data does not have the properties soundAliasesOrder");
                return;
            }

            if (data.hasOwnProperty("filters")) {
                let f = (data as ExportedSounds)["filters"];
                if (f) {
                    this.filtersAll = FilterMemoryToFilter(f);
                }
            }

            if (data.hasOwnProperty("playInStepIndex")) {
                let playInStepIndex = (data as ExportedSounds)["playInStepIndex"];
                if (playInStepIndex) {
                    SoundManagerStatic.soundsPlaying = playInStepIndex;
                }
            }

            if (data.hasOwnProperty("sounds")) {
                let sounds = (data as ExportedSounds)["sounds"];
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
                        } else if (step.stepIndex === lastStepIndex) {
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
                let soundsPlaying = (data as ExportedSounds)["soundsPlaying"];
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
                        } else if (step.stepIndex === lastStepIndex) {
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
