import { Label } from "./Label"
import { Step } from "./Step"

type HystoryElement = {
    path: string,
    storage: object,
    lastLabet: Label,
    lastStep: Step,
    lastStepNumber: number,
}

export class HistoryManager {
    private constructor() { }
    public history: HystoryElement[] = []
}
