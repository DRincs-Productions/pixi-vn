import { SupportedCanvasElementMemory } from "../../types/SupportedCanvasElement";
import { IClassWithArgsHistory } from "../IClassWithArgsHistory";

/**
 * Interface exported canvas
 */
export interface ExportedCanvas {
    currentTickers: IClassWithArgsHistory<any>[]
    currentElements: { [tag: string]: SupportedCanvasElementMemory }
    childrenTagsOrder: string[]
}
