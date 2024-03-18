import { ExportedCanvas } from "./export/ExportedCanvas";
import { ExportedStep } from "./export/ExportedStep";
import { ExportedStorage } from "./export/ExportedStorage";

export interface ISaveData {
    version: string
    stepData: ExportedStep
    storageData: ExportedStorage
    canvasData: ExportedCanvas
}