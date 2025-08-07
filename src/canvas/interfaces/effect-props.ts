import AnimationOptions from "../types/AnimationOptions";
import { BaseTransitionProps } from "./transition-props";

export interface ShakeEffectProps extends BaseTransitionProps, AnimationOptions {
    /**
     * The number of shocks. **Must be at least 3**.
     * @default 10
     */
    shocksNumber?: number;
    /**
     * The type of the shake effect
     * @default "horizontal"
     */
    shakeType?: "horizontal" | "vertical";
    /**
     * The maximum size of the shock.
     * For horizontal type, it is the maximum size of the x axis.
     * For vertical type, it is the maximum size of the y axis.
     * @default 10
     */
    maxShockSize?: number;
}
