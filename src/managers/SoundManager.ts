import { CompleteCallback, Filter, IMedia, IMediaContext, IMediaInstance, Options, PlayOptions, Sound, sound, SoundLibrary, SoundMap, SoundSourceMap } from '@pixi/sound';
import ExportedSounds from '../interface/export/ExportedSounds';

export default class GameSoundManager extends SoundLibrary {
    private static childrenTagsOrder: string[] = []

    override get context(): IMediaContext {
        return sound.context
    }
    override   get filtersAll(): Filter[] {
        return sound.filtersAll
    }
    override  set filtersAll(filtersAll: Filter[]) {
        sound.filtersAll = filtersAll
    }
    override   get supported(): boolean {
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

    static clear() {
        sound.removeAll()
    }

    /* Export and Import Methods */

    public static exportJson(): string {
        return JSON.stringify(this.export())
    }
    public static export(): ExportedSounds {
        let soundElements: { [key: string]: { media: IMedia, options: Options } } = {}
        for (let tag of GameSoundManager.childrenTagsOrder) {
            if (sound.exists(tag)) {
                let item = sound.find(tag)
                if (item.loop) {
                    soundElements[tag] = {
                        media: item.media,
                        options: item.options,
                    }
                }
            }
        }
        return {
            sounds: soundElements
        }
    }
    public static importJson(dataString: string) {
        GameSoundManager.import(JSON.parse(dataString))
    }
    public static import(data: object) {
        GameSoundManager.clear()
        try {
            if (data.hasOwnProperty("sounds") && data.hasOwnProperty("currentElements")) {
                let sounds = (data as ExportedSounds)["sounds"]
                for (let tag in sounds) {
                    let item = sounds[tag]
                    sound.add(tag, item.options)
                    sound.find(tag).media = item.media
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
