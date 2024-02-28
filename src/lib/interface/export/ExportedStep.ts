import { LabelHistoryDataType } from "../../types/LabelHistoryDataType"
import { HistoryLabelEvent } from "../HistoryLabelEvent"
import { HistoryStep } from "../HistoryStep"

export interface ExportedStep {
    stepsHistory: (HistoryLabelEvent | HistoryStep)[]
    openedLabels: LabelHistoryDataType[]
}
