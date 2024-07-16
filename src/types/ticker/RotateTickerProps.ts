import { TickerProgrationType } from "../../interface"

export type RotateTickerProps = {
    /**
     * The speed of the rotation
     * @default 1
     */
    speed?: number
    /**
     * The direction of the rotation
     * @default true
     */
    clockwise?: boolean
    /**
     * The progression of the speed
     */
    speedProgression?: TickerProgrationType
    /**
     * The tag to remove after the fade is done
     * @default []
     */
    tagToRemoveAfter?: string[] | string
    /**
     * If true, the effect only starts if the canvas element have a texture
     * @default false
     */
    startOnlyIfHaveTexture?: boolean
}