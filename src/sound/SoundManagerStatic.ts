import { SoundPlay } from "../interface/export/ExportedSounds";
import Sound from "./classes/Sound";

export default class SoundManagerStatic {
    private constructor() {}
    static soundAliasesOrder: string[] = [];
    static soundsPlaying: { [key: string]: SoundPlay } = {};
    static sounds: { [key: string]: Sound } = {};
}
