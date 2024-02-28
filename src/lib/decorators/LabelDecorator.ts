import { Label } from "../classes/Label"
import { GameStepManager } from "../managers/StepManager"

/**
 * LabelDecorator is a decorator that register a label in the game.
 * Is a required decorator for use the label in the game.
 * Thanks to this decoration the game has the possibility of updating the labels to the latest modification and saving the game.
 * @param name is th identifier of the label, by default is the name of the class
 * @returns 
 */
export function labelDecorator(name?: string) {
    return function (target: typeof Label) {
        if (!name) {
            name = target.name
        }
        if (GameStepManager.registeredLabels[name]) {
            console.warn(`Label ${name} already exists, it will be overwritten`)
        }
        GameStepManager.registeredLabels[name] = target
    }
}
