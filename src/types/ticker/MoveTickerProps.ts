import { TickerProgrationType } from "../../interface"

export type MoveTickerProps = {
    /**
     * The speed of the movement (1 pixels per 0.1 second)
     * @default 10
     */
    speed?: number | { x: number, y: number }
    /**
     * The destination of the movement
     */
    destination: {
        /**
         * The type of the destination. Possible values are "pixel", "percentage" and "align":
         * - "pixel": The destination is in pixel
         * - "percentage": The destination is in percentage
         * - "align": The destination is in align
         * @default "pixel"
         */
        type?: "pixel" | "percentage" | "align",
        y: number,
        x: number,
    }
    /**
     * The progression of the speed
     */
    speedProgression?: TickerProgrationType
    /**
     * The alias to remove after the fade is done
     * @default []
     */
    aliasToRemoveAfter?: string[] | string
    /**
     * If true, the effect only starts if the canvas element have a texture
     * @default false
     */
    startOnlyIfHaveTexture?: boolean
    /**
     * The alias to resume after the effect is done
     * @default []
     */
    tickerAliasToResume?: string[] | string
    /**
     * Is a special prop used in the push in/out transition.
     * If true, get the first child of the container and add it to canvas on the end of the effect.
     * @default false
     */
    isPushInOut?: boolean
}
