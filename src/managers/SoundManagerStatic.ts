import { Sound } from "../classes"
import { ExportedSoundPlay } from "../interface/export/ExportedSounds"

export default class SoundManagerStatic {
    static soundAliasesOrder: string[] = []
    static playInStepIndex: ExportedSoundPlay = {}
    static sounds: { [key: string]: Sound } = {}
}
