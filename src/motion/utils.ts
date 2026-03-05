import type { Ticker as PixiTicker } from "@drincs/pixi-vn/pixi.js";
import { AnimationOptions } from "motion";

/**
 * Create a motion driver that integrates with the PixiJS ticker. This driver will allow you to use motion's animation capabilities while ensuring that animations are synchronized with the PixiJS rendering loop.
 * @param ticker - The PixiJS ticker to integrate with. If not provided, a new ticker will be created.
 * @returns An object that implements the motion driver interface, allowing you to start, stop, and control animations using the PixiJS ticker.
 * @example
 * const ticker = new PIXI.Ticker();
 * const driver = motionDriver(ticker);
 * const animation = animate(mySprite, { x: 100 }, { duration: 1, driver });
 * animation.start();
 */
export const motionDriver: (ticker: PixiTicker) => AnimationOptions["driver"] = (ticker) => (update) => {
    const passTimestamp = ({ lastTime }: PixiTicker) => update(lastTime);
    return {
        start: (_keepAlive = true) => {
            ticker.add(passTimestamp);
            ticker.start();
        },
        stop: () => ticker.remove(passTimestamp),
        now: () => ticker.lastTime,
    };
};
