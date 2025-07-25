import TickerProgrationType from "../interfaces/TickerProgrationType";
import { CommonTickerProps } from "./CommonTickerProps";

export type RotateTickerProps = {
    /**
     * The speed of the rotation (360 degree per 10 second)
     * @default 1
     */
    speed?: number;
    /**
     * The direction of the rotation
     * @default true
     */
    clockwise?: boolean;
    /**
     * The limit of the rotation, is specified in degree
     * @default undefined
     */
    limit?: number;
    /**
     * The progression of the speed
     */
    speedProgression?: TickerProgrationType;
} & CommonTickerProps;
