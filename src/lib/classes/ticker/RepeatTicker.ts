import { tickerDecorator } from "../../decorators/TickerDecorator";
import { TickerClass } from "../TickerClass";

/**
 * A ticker that reapets the Ticker steps.
 */
@tickerDecorator()
export class RepeatTicker extends TickerClass<{}> {
    override fn(): void { }
}
