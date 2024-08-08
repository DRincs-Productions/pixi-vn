import { ChoiceMenuOptionsType } from "../types"

/**
 * Step label JSON type
 */
type StepLabelJsonType = {
    currentChoiceMenuOptions?: ChoiceMenuOptionsType<{}>
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
