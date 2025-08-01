import { MoveTickerProps } from "../tickers";
import AnimationOptions from "../types/AnimationOptions";

interface BaseTransitionProps {
    /**
     * If true, the transition will be completed before the next step.
     * For example, if the transition is a dissolve transition, the "alpha" of the texture will be 1 before the next step.
     * @default true
     */
    mustBeCompletedBeforeNextStep?: boolean;
}

export interface ShowWithDissolveTransitionProps extends BaseTransitionProps, AnimationOptions {}
export interface ShowWithFadeTransitionProps extends BaseTransitionProps, AnimationOptions {}
export interface MoveInOutProps extends BaseTransitionProps, AnimationOptions {
    /**
     * The direction of the movement.
     * @default "right"
     */
    direction?: "up" | "down" | "left" | "right";
}
export interface ZoomInOutProps extends BaseTransitionProps, AnimationOptions {
    /**
     * The direction of the zoom effect.
     * @default "right"
     */
    direction?: "up" | "down" | "left" | "right";
}
export interface PushInOutProps
    extends BaseTransitionProps,
        Omit<MoveTickerProps, "startOnlyIfHaveTexture" | "destination" | "isPushInOut"> {
    /**
     * The direction of the push effect.
     * @default "right"
     */
    direction?: "up" | "down" | "left" | "right";
}
