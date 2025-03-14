import { TickerProgrationType } from "../../interfaces";

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
    /**
     * The alias to remove after the fade is done
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
};
