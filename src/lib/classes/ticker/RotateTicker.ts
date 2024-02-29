import { tickerDecorator } from "../../decorators/TickerDecorator";
import { TickerClass } from "../TickerClass";
import { CanvasBase } from "../canvas/CanvasBase";

@tickerDecorator()
export class RotateTicker extends TickerClass<{ speed: number }> {
    override fn(delta: number, args: { speed: number }, elements: CanvasBase<any, any>[]): void {
        elements.forEach((element) => {
            if (element.hasOwnProperty("rotation") && typeof (element as any).rotation === "number") {
                (element as any).rotation += args.speed * delta;
            }
        })
    }
}
