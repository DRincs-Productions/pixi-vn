export type StepLabel = (() => void | Promise<void>)
type StepEquivelent = {
    hystoryIndex: number,
    labelIndex: number,
}

export abstract class Label {
    abstract getSteps(): StepLabel[];
    public get steps() {
        return this.getSteps()
    }
    public checkIfStepIsEqual(step: string, step2: StepLabel): boolean {
        return step === step2.toString()
    }
    public findLastStepIndex(hystorySteps: string[]): StepEquivelent | null {
        let hypotheticalIndex: number = hystorySteps.length - 1
        if (hystorySteps.length === 0) {
            return null
        }
        if (hystorySteps.length === 1) {
            let step = hystorySteps[0]
            if (this.checkIfStepIsEqual(step, this.steps[0])) {
                return { hystoryIndex: 0, labelIndex: 0 }
            }
            else {
                return null
            }
        }
        // TODO: find the bests combination of steps
        // TODO: Knapsack Problem
        // TODO: return the best combination near the hypotheticalIndex
        return null
    }
}
