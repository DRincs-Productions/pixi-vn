import { TickerProgrationType } from "../../interfaces";

export type ZoomTickerProps = {
    /**
     * The speed of the zoom effect (100% zoom per 10 second)
     * @default 10
     */
    speed?: number | { x: number; y: number };
    /**
     * The type of the zoom effect
     * @default "zoom"
     */
    type?: "zoom" | "unzoom";
    /**
     * The limit of the effect
     * @default type === "zoom" ? Infinity : 0
     */
    limit?: number | { x: number; y: number };
    /**
     * The progression of the speed.
     * There are two types of progression: linear and exponential.
     * - Linear: The speed will increase by the amount of `amt` every frame.
     * - Exponential: The speed will increase by the percentage of the current speed every frame.
     * @default undefined
     */
    speedProgression?: TickerProgrationType;
    /**
     * The alias to remove after the effect is done
     * @default []
     */
    aliasToRemoveAfter?: string[] | string;
    /**
     * If true, the effect only starts if the canvas element have a texture
     * @default false
     */
    startOnlyIfHaveTexture?: boolean;
    /**
     * The alias to resume after the effect is done
     * @default []
     */
    tickerAliasToResume?: string[] | string;
    /**
     * Is a special prop used in the zoom in/out transition.
     * @default false
     */
    isZoomInOut?: {
        pivot: { x: number; y: number };
        position: { x: number; y: number };
    };
};
