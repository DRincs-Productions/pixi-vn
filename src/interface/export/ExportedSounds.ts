import { IMedia, Options } from "@pixi/sound";

/**
 * Interface exported sounds
 */
export default interface ExportedSounds {
    sounds: { [key: string]: { media: IMedia, options: Options } }
}
