import { LabelRunModeType, StorageObjectType } from "../types"
import { LabelIdType } from "./LabelIdType"

/**
 * Step label JSON type
 */
type StepLabelJsonType = {
    currentChoiceMenuOptions?: {
        text: string
        label: LabelIdType
        type: LabelRunModeType
        props: StorageObjectType
    }
    dialog?: {
        character: string,
        text: string,
    } | string
    labelToOpen?: {
        labelId: string,
        type: "jump" | "call",
    }
    end?: "game_end" | "label_end"
}

export default StepLabelJsonType
