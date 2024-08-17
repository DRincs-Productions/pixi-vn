import { CompleteCallback, Filter, filters, IMediaContext, IMediaInstance, Options, PlayOptions, Sound, sound, SoundLibrary, SoundMap, SoundSourceMap } from '@pixi/sound';
import PixiSound from '../classes/Sound';
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
    override add(alias: string, options: Options | string | ArrayBuffer | AudioBuffer | HTMLAudioElement | Sound): Sound;
    /**
     * @deprecated: Use `add(alias: string, options: Options | string | ArrayBuffer | AudioBuffer | HTMLAudioElement | Sound): Sound;` instead.
     */
    override add(map: SoundSourceMap, globalOptions?: Options): SoundMap;
    public override add(alias: string | SoundSourceMap, sourceOptions?: Options | string | ArrayBuffer | AudioBuffer | HTMLAudioElement | Sound): any {
        if (typeof alias === 'object') {
            throw new Error("[Pixi'VN] The method add(map: SoundSourceMap, globalOptions?: Options) is deprecated. Use add(alias: string, options: Options | string | ArrayBuffer | AudioBuffer | HTMLAudioElement | Sound): Sound; instead.")
        }

        !SoundManagerStatic.childrenTagsOrder.includes(alias) && SoundManagerStatic.childrenTagsOrder.push(alias)

        if (sourceOptions instanceof Sound) {
            sourceOptions = sourceOptions.options
        }

        const options: Options = this.getOptions(sourceOptions || {});
        const s: PixiSound = PixiSound.from(options);
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
        return sound.find(alias)
    }
    override play(alias: string, options?: PlayOptions | CompleteCallback | string): IMediaInstance | Promise<IMediaInstance> {
        return sound.play(alias, options)
    }
    override stop(alias: string): Sound {
        return sound.stop(alias)
    }
    override  pause(alias: string): Sound {
        return sound.pause(alias)
    }
    override resume(alias: string): Sound {
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
                    isPlaying: item.isPlaying,
                    filters: FilterToFilterMemory(item.media.filters),
                }
            }
        }
        return {
            sounds: soundElements,
            childrenTagsOrder: SoundManagerStatic.childrenTagsOrder,
            filters: FilterToFilterMemory(sound.filtersAll)
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
            else {
                console.error("[Pixi'VN] The data does not have the properties filters")
                return
            }

            if (data.hasOwnProperty("sounds")) {
                let sounds = (data as ExportedSounds)["sounds"]
                for (let tag in sounds) {
                    let item = sounds[tag]
                    let audio = sound.add(tag, item.options)
                    if (item.filters) {
                        audio.filters = FilterMemoryToFilter(item.filters)
                    }
                    if (item.isPlaying) {
                        setTimeout(() => {
                            sound.play(tag)
                        }, 200)
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
