type StepLabel = () => void

export class Step extends Object {
    label: StepLabel

    constructor(label: StepLabel) {
        super()
        this.label = label
    }
}
