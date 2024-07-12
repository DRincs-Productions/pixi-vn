import { TickerProgrationType } from "../../interface"

export type TickerRotateProps = {
    /**
     * The speed of the rotation in pixels per second
     * @default 0.1
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
     * If true, the rotation only starts if the canvas element have a texture
     */
    startOnlyIfHaveTexture?: boolean
}