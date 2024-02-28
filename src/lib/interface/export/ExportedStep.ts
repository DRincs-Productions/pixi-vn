import { LabelHistoryDataType } from "../../types/LabelHistoryDataType"
import { IHistoryLabelEvent } from "../IHistoryLabelEvent"
import { IHistoryStep } from "../IHistoryStep"

export interface ExportedStep {
    stepsHistory: (IHistoryLabelEvent | IHistoryStep)[]
    openedLabels: LabelHistoryDataType[]
}
