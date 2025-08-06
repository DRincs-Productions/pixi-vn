import TickerProgrationType from "../interfaces/TickerProgrationType";
import { CommonTickerProps } from "./CommonTickerProps";

/**
 * @deprecated
 */
export type FadeAlphaTickerProps = {
    /**
     * @deprecated use speed instead
     * @default 1
     */
    duration?: number;
    /**
     * The speed of the effect (1 alpha per 10 second)
     * @default 5
     */
    speed?: number;
    /**
     * The type of the fade
     * @default "hide"
     */
    type?: "hide" | "show";
    /**
     * The limit of the fade
     * @default type === "hide" ? 0 : 1
     */
    limit?: number;
    /**
     * The progression of the speed
     */
    speedProgression?: TickerProgrationType;
} & CommonTickerProps;
