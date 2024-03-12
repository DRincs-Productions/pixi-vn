import { SupportedCanvasElementMemory } from "../../types/SupportedCanvasElement";
import { IClassWithArgsHistoryForExport } from "../IClassWithArgsHistory";

/**
 * Interface exported canvas
 */
export interface ExportedCanvas {
    currentTickers: IClassWithArgsHistoryForExport<any>[]
    currentElements: { [tag: string]: SupportedCanvasElementMemory }
    childrenTagsOrder: string[]
}
