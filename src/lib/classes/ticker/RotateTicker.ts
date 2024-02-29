import { tickerDecorator } from "../../decorators/TickerDecorator";
import { GameWindowManager } from "../../managers/WindowManager";
import { TickerClass } from "../TickerClass";
import { CanvasSprite } from "../canvas/CanvasSprite";

@tickerDecorator()
export class RotateTicker extends TickerClass<{ speed: number }> {
    override fn(delta: number, args: { speed: number }, childTags: string[]): void {
        childTags.forEach((tag) => {
            let element = GameWindowManager.getChild(tag)
            if (element && element instanceof CanvasSprite) {
                element.rotation += args.speed * delta;
            }
        })
    }
}
