import { TickerProgrationType } from "../tickers";

export interface ShakeEffectProps {
    /**
     * The speed of the shake effect. @default 20
     */
    speed?: number;
    /**
     * The progression of the speed
     */
    speedProgression?: TickerProgrationType;
    /**
     * If true, the effect only starts if the canvas element have a texture
     * @default false
     */
    startOnlyIfHaveTexture?: boolean;
    /**
     * The number of shocks. **Must be at least 3**.
     * @default 10
     */
    shocksNumber?: number;
    /**
     * The type of the shake effect
     * @default "horizontal"
     */
    type?: "horizontal" | "vertical";
    /**
     * The maximum size of the shock.
     * For horizontal type, it is the maximum size of the x axis.
     * For vertical type, it is the maximum size of the y axis.
     * @default 10
     */
    maximumShockSize?: number;
}
