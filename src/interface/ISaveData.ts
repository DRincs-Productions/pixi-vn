import ExportedCanvas from "./export/ExportedCanvas"
import ExportedSounds from "./export/ExportedSounds"
import ExportedStep from "./export/ExportedStep"
import ExportedStorage from "./export/ExportedStorage"

export default interface ISaveData {
    pixivn_version: string
    stepData: ExportedStep
    storageData: ExportedStorage
    canvasData: ExportedCanvas
    soundData: ExportedSounds
    path: string
}