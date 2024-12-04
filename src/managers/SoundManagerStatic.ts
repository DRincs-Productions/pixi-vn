import { Sound } from "../classes"
import { SoundPlay } from "../interface/export/ExportedSounds"

export default class SoundManagerStatic {
    private constructor() { }
    static soundAliasesOrder: string[] = []
    static soundsPlaying: { [key: string]: SoundPlay } = {}
    static sounds: { [key: string]: Sound } = {}
}
