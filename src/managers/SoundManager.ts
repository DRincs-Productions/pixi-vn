import { CompleteCallback, Filter, filters, IMediaContext, IMediaInstance, Options, Sound as PixiSound, PlayOptions, sound, SoundLibrary, SoundMap, SoundSourceMap } from '@pixi/sound';
import { narration } from '.';
import { Sound } from '../classes';
import { FilterMemoryToFilter, FilterToFilterMemory } from '../functions/SoundUtility';
import { ExportedSound, ExportedSounds } from '../interface';
import SoundManagerStatic from './SoundManagerStatic';

export default class GameSoundManager extends SoundLibrary {
    override get context(): IMediaContext {
        return sound.context
    }
    override get filtersAll(): Filter[] {
        return sound.filtersAll
    }
    override set filtersAll(filtersAll: Filter[]) {
        sound.filtersAll = filtersAll.filter(f => {
            return !(f instanceof filters.Filter);
        })
    }
    override get supported(): boolean {
        return sound.supported
    }

    /**
     * https://github.com/pixijs/sound/blob/main/src/SoundLibrary.ts#L187
     */
    private getOptions(source: string | ArrayBuffer | AudioBuffer | HTMLAudioElement | Options,
        overrides?: Options): Options {
        let options: Options;

        if (typeof source === 'string') {
            options = { url: source };
        }
        else if (Array.isArray(source)) {
            options = { url: source };
        }
        else if (source instanceof ArrayBuffer || source instanceof AudioBuffer || source instanceof HTMLAudioElement) {
            options = { source };
        }
        else {
            options = source as Options;
        }
        options = { ...options, ...(overrides || {}) };

        return options;
    }
    override add(alias: string, options: Options | string | ArrayBuffer | AudioBuffer | HTMLAudioElement | PixiSound): PixiSound;
    /**
     * @deprecated: Use `add(alias: string, options: Options | string | ArrayBuffer | AudioBuffer | HTMLAudioElement | Sound): Sound;` instead.
     */
    override add(map: SoundSourceMap, globalOptions?: Options): SoundMap;
    public override add(alias: string | SoundSourceMap, sourceOptions?: Options | string | ArrayBuffer | AudioBuffer | HTMLAudioElement | PixiSound): any {
        if (typeof alias === 'object') {
            throw new Error("[Pixi'VN] The method add(map: SoundSourceMap, globalOptions?: Options) is deprecated. Use add(alias: string, options: Options | string | ArrayBuffer | AudioBuffer | HTMLAudioElement | Sound): Sound; instead.")
        }

        !SoundManagerStatic.childrenTagsOrder.includes(alias) && SoundManagerStatic.childrenTagsOrder.push(alias)

        if (sourceOptions instanceof PixiSound) {
            sourceOptions = sourceOptions.options
        }

        const options: Options = this.getOptions(sourceOptions || {});
        const s: Sound = Sound.from(options);
        s.alias = alias;
        sound.add(alias, s);
    }
    override get useLegacy(): boolean {
        return sound.useLegacy
    }
    override set useLegacy(legacy: boolean) {
        sound.useLegacy = legacy
    }
    override get disableAutoPause(): boolean {
        return sound.disableAutoPause
    }
    override set disableAutoPause(autoPause: boolean) {
        sound.disableAutoPause = autoPause
    }
    override remove(alias: string): this {
        SoundManagerStatic.childrenTagsOrder = SoundManagerStatic.childrenTagsOrder.filter((t) => t !== alias)
        return sound.remove(alias) as this
    }
    override get volumeAll(): number {
        return sound.volumeAll
    }
    override set volumeAll(volume: number) {
        sound.volumeAll = volume
    }
    override get speedAll(): number {
        return sound.speedAll
    }
    override set speedAll(speed: number) {
        sound.speedAll = speed
    }
    override togglePauseAll(): boolean {
        return sound.togglePauseAll()
    }
    override pauseAll(): this {
        return sound.pauseAll() as this
    }
    override resumeAll(): this {
        return sound.resumeAll() as this
    }
    override toggleMuteAll(): boolean {
        return sound.toggleMuteAll()
    }
    override muteAll(): this {
        return sound.muteAll() as this
    }
    override unmuteAll(): this {
        return sound.unmuteAll() as this
    }
    override removeAll(): this {
        SoundManagerStatic.childrenTagsOrder = []
        return sound.removeAll() as this
    }
    override stopAll(): this {
        return sound.stopAll() as this
    }
    override exists(alias: string, assert?: boolean): boolean {
        return sound.exists(alias, assert)
    }
    override isPlaying(): boolean {
        return sound.isPlaying()
    }
    override find(alias: string): Sound {
        let item = sound.find(alias)
        let newItem = new Sound(item.media, item.options)
        newItem.alias = alias
        return newItem
    }
    override play(alias: string, options?: PlayOptions | CompleteCallback | string): IMediaInstance | Promise<IMediaInstance> {
        if (!this.exists(alias)) {
            throw new Error(`[Pixi'VN] The sound alias "${alias}" is not found.`)
        }
        let sound = this.find(alias)
        let loop = sound.loop
        if (options && typeof options === 'object' && options?.loop !== undefined) {
            loop = options.loop;
        }
        SoundManagerStatic.playInStepIndex[alias] = {
            stepIndex: narration.lastStepIndex,
            loop: loop,
            paused: false
        }
        return sound.play(alias, options as any)
    }
    override stop(alias: string): Sound {
        delete SoundManagerStatic.playInStepIndex[alias];
        return sound.stop(alias)
    }
    override  pause(alias: string): Sound {
        let item = SoundManagerStatic.playInStepIndex[alias]
        if (!item) {
            throw new Error("[Pixi'VN] The alias is not found in the playInStepIndex.");
        }
        SoundManagerStatic.playInStepIndex[alias] = {
            ...item,
            paused: true
        }
        return sound.pause(alias)
    }
    override resume(alias: string): Sound {
        let item = SoundManagerStatic.playInStepIndex[alias]
        if (!item) {
            throw new Error("[Pixi'VN] The alias is not found in the playInStepIndex.");
        }
        SoundManagerStatic.playInStepIndex[alias] = {
            loop: item.loop,
            stepIndex: narration.lastStepIndex,
            paused: false
        }
        return sound.resume(alias)
    }
    override volume(alias: string, volume?: number): number {
        return sound.volume(alias, volume)
    }
    override speed(alias: string, speed?: number): number {
        return sound.speed(alias, speed)
    }
    override duration(alias: string): number {
        return sound.duration(alias)
    }
    override close(): this {
        return sound.close() as this
    }

    clear() {
        sound.removeAll()
    }

    /* Export and Import Methods */

    public exportJson(): string {
        return JSON.stringify(this.export())
    }
    public export(): ExportedSounds {
        let soundElements: ExportedSound = {}
        for (let tag of SoundManagerStatic.childrenTagsOrder) {
            if (sound.exists(tag)) {
                let item = sound.find(tag)
                soundElements[tag] = {
                    options: item.options,
                    filters: FilterToFilterMemory(item.media.filters),
                }
            }
        }
        return {
            sounds: soundElements,
            childrenTagsOrder: SoundManagerStatic.childrenTagsOrder,
            filters: FilterToFilterMemory(sound.filtersAll),
            playInStepIndex: SoundManagerStatic.playInStepIndex
        }
    }
    public removeOldSoundAndExport(): ExportedSounds {
        // let childrenTagsOrder = []
        // for (let tag of GameSoundManager.childrenTagsOrder) {
        //     if (sound.exists(tag)) {
        //         let s = sound.find(tag)
        //         if (s.loop) {
        //             childrenTagsOrder.push(tag)
        //         }
        //     }
        // }
        // GameSoundManager.childrenTagsOrder = childrenTagsOrder
        return this.export()
    }
    public importJson(dataString: string) {
        this.import(JSON.parse(dataString))
    }
    public import(data: object) {
        this.stopAll()
        this.clear()
        try {
            if (data.hasOwnProperty("childrenTagsOrder")) {
                SoundManagerStatic.childrenTagsOrder = (data as ExportedSounds)["childrenTagsOrder"]
            }
            else {
                console.error("[Pixi'VN] The data does not have the properties childrenTagsOrder")
                return
            }

            if (data.hasOwnProperty("filters")) {
                let f = (data as ExportedSounds)["filters"]
                if (f) {
                    this.filtersAll = FilterMemoryToFilter(f)
                }
            }

            if (data.hasOwnProperty("playInStepIndex")) {
                SoundManagerStatic.playInStepIndex = (data as ExportedSounds)["playInStepIndex"]
            }
            else {
                console.error("[Pixi'VN] The data does not have the properties playInStepIndex")
                return
            }

            if (data.hasOwnProperty("sounds")) {
                let sounds = (data as ExportedSounds)["sounds"]
                for (let alias in sounds) {
                    let item = sounds[alias]
                    let audio = sound.add(alias, item.options)
                    if (item.filters) {
                        audio.filters = FilterMemoryToFilter(item.filters)
                    }
                    if (alias in SoundManagerStatic.playInStepIndex) {
                        let step = SoundManagerStatic.playInStepIndex[alias]
                        if (step.loop) {
                            sound.play(alias)
                        } else if (step.stepIndex === narration.lastStepIndex - 1) {
                            sound.play(alias)
                        }
                    }
                }
            }
            else {
                console.error("[Pixi'VN] The data does not have the properties sounds")
                return
            }
        }
        catch (e) {
            console.error("[Pixi'VN] Error importing data", e)
        }
    }
}
