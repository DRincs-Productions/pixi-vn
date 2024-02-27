export class TickerElement {
    fn(dt: number) {
        console.warn("This method should be overridden", dt)
        throw new Error("This method should be overridden")
    }
}
