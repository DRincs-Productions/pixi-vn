import { Label } from "../classes"
import { LabelIdType } from "../types/LabelIdType"

export const registeredLabels: { [key: LabelIdType]: typeof Label } = {}
/**
 * Is a decorator that register a label in the game.
 * Is a required decorator for use the label in the game.
 * Thanks to this decoration the game has the possibility of updating the labels to the latest modification and saving the game.
 * @param name is th identifier of the label, by default is the name of the class
 * @returns 
 */
export default function labelDecorator(name?: LabelIdType) {
    return function (target: typeof Label) {
        if (!name) {
            name = target.name
        }
        if (registeredLabels[name]) {
            console.warn(`Label ${name} already exists, it will be overwritten`)
        }
        registeredLabels[name] = target
    }
}

/**
 * is a function that returns the type of the label
 * @param labelName is the name of the label
 * @returns the label type
 */
export function getLabelTypeByClassName<T extends typeof Label>(labelName: LabelIdType): T | undefined {
    try {
        let labelType = registeredLabels[labelName]
        if (!labelType) {
            console.error(`Label ${labelName} not found`)
            return
        }
        new labelType()
        return labelType as T
    }
    catch (e) {
        console.error(e)
        return
    }
}

/**
 * is a function that returns the instance of the label
 * @param labelName is the name of the label
 * @returns the label
 */
export function getLabelInstanceByClassName<T extends Label>(labelName: LabelIdType): T | undefined {
    try {
        let labelType = registeredLabels[labelName]
        if (!labelType) {
            console.error(`Label ${labelName} not found`)
            return
        }
        let label = new labelType()
        let step = label.steps
        if (step.length = 0) {
            console.warn(`Label ${labelName} has no steps`)
        }
        return label as T
    }
    catch (e) {
        console.error(e)
        return
    }
}
