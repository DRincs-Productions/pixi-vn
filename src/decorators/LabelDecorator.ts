import { Label } from "../classes"
import { LabelProps } from "../interface"
import { StepLabelType } from "../types"
import { LabelIdType } from "../types/LabelIdType"

export const registeredLabels: { [key: LabelIdType]: Label<any> } = {}

/**
 * Creates a new label and registers it in the system.
 * **This function must be called at least once at system startup to register the label, otherwise the system cannot be used.**
 * @param id The id of the label, it must be unique
 * @param steps The steps of the label
 * @param props The properties of the label
 * @returns The created label
 */
export function newLabel<T extends {} = {}>(id: LabelIdType, steps: StepLabelType<T>[] | (() => StepLabelType<T>[]), props?: Omit<LabelProps<Label<T>>, "choiseIndex">): Label<T> {
    if (registeredLabels[id]) {
        console.info(`[Pixi'VN] Label ${id} already exists, it will be overwritten`)
    }
    let label = new Label<T>(id, steps, props)
    registeredLabels[id] = label
    return label
}

/**
 * Gets a label by its id
 * @param id The id of the label
 * @returns The label or undefined if it does not exist
 */
export function getLabelById<T = Label<any>>(id: LabelIdType): T | undefined {
    let label = registeredLabels[id]
    if (!label) {
        console.error(`[Pixi'VN] Label ${id} not found`)
        return
    }
    return label as T
}
