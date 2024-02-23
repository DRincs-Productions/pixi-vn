export abstract class Label {
    abstract getSteps(): (string);
    public get steps() {
        return this.getSteps()
    }
}
