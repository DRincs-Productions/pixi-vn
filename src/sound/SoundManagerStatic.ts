import Sound from "./classes/Sound";
import { SoundPlay } from "./interfaces/ExportedSounds";

export default class SoundManagerStatic {
    private constructor() {}
    static soundAliasesOrder: string[] = [];
    static soundsPlaying: { [key: string]: SoundPlay } = {};
    static sounds: { [key: string]: Sound } = {};
}
