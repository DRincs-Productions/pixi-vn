import { CompleteCallback, Filter, IMediaContext, IMediaInstance, Options, PlayOptions, Sound, sound, SoundLibrary, SoundMap, SoundSourceMap } from '@pixi/sound';
import { FilterMemoryToFilter, FilterToFilterMemory } from '../functions/SoundUtility';
import { ExportedSound, ExportedSounds } from '../interface';

export default class GameSoundManager extends SoundLibrary {
    private static childrenTagsOrder: string[] = []

    override get context(): IMediaContext {
        return sound.context
    }
    override get filtersAll(): Filter[] {
        return sound.filtersAll
    }
    override set filtersAll(filtersAll: Filter[]) {
        sound.filtersAll = filtersAll
    }
    override get supported(): boolean {
        return sound.supported
    }
    add(alias: string, options: Options | string | ArrayBuffer | AudioBuffer | HTMLAudioElement | Sound): Sound;
    add(map: SoundSourceMap, globalOptions?: Options): SoundMap;
    add(alias: any, options: any): any {
        GameSoundManager.childrenTagsOrder.push(alias)
        return sound.add(alias, options)
    }
    get useLegacy(): boolean {
        return sound.useLegacy
    }
    set useLegacy(legacy: boolean) {
        sound.useLegacy = legacy
    }
    get disableAutoPause(): boolean {
        return sound.disableAutoPause
    }
    set disableAutoPause(autoPause: boolean) {
        sound.disableAutoPause = autoPause
    }
    remove(alias: string): this {
        GameSoundManager.childrenTagsOrder = GameSoundManager.childrenTagsOrder.filter((t) => t !== alias)
        return sound.remove(alias) as this
    }
    get volumeAll(): number {
        return sound.volumeAll
    }
    set volumeAll(volume: number) {
        sound.volumeAll = volume
    }
    get speedAll(): number {
        return sound.speedAll
    }
    set speedAll(speed: number) {
        sound.speedAll = speed
    }
    togglePauseAll(): boolean {
        return sound.togglePauseAll()
    }
    pauseAll(): this {
        return sound.pauseAll() as this
    }
    resumeAll(): this {
        return sound.resumeAll() as this
    }
    toggleMuteAll(): boolean {
        return sound.toggleMuteAll()
    }
    muteAll(): this {
        return sound.muteAll() as this
    }
    unmuteAll(): this {
        return sound.unmuteAll() as this
    }
    removeAll(): this {
        GameSoundManager.childrenTagsOrder = []
        return sound.removeAll() as this
    }
    stopAll(): this {
        return sound.stopAll() as this
    }
    exists(alias: string, assert?: boolean): boolean {
        return sound.exists(alias, assert)
    }
    isPlaying(): boolean {
        return sound.isPlaying()
    }
    find(alias: string): Sound {
        return sound.find(alias)
    }
    play(alias: string, options?: PlayOptions | CompleteCallback | string): IMediaInstance | Promise<IMediaInstance> {
        return sound.play(alias, options)
    }
    stop(alias: string): Sound {
        return sound.stop(alias)
    }
    pause(alias: string): Sound {
        return sound.pause(alias)
    }
    resume(alias: string): Sound {
        return sound.resume(alias)
    }
    volume(alias: string, volume?: number): number {
        return sound.volume(alias, volume)
    }
    speed(alias: string, speed?: number): number {
        return sound.speed(alias, speed)
    }
    duration(alias: string): number {
        return sound.duration(alias)
    }
    close(): this {
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
        for (let tag of GameSoundManager.childrenTagsOrder) {
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
            sounds: soundElements
        }
    }
    public importJson(dataString: string) {
        this.import(JSON.parse(dataString))
    }
    public import(data: object) {
        this.stopAll()
        this.clear()
        try {
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
