import { tickerDecorator } from "../../decorators/TickerDecorator";
import { TickerClass } from "../TickerClass";

/**
 * A ticker that pauses the Ticker steps.
 */
@tickerDecorator()
export class PauseTicker extends TickerClass<{}> {
    override fn(): void { }
}
