import { Label } from "../classes/Label"
import { GameStepManager } from "../managers/StepManager"

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
