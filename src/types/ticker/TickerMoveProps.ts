import { TickerProgrationType } from "../../interface"

export type TickerMoveProps = {
    /**
     * The speed of the movement
     * @default 0.1
     */
    speed?: number
    /**
     * The destination of the movement
     */
    destination: {
        y: number,
        x: number,
    }
    /**
     * The progression of the speed
     */
    speedProgression?: TickerProgrationType
    /**
     * If true, the rotation only starts if the canvas element have a texture
     */
    startOnlyIfHaveTexture?: boolean
}
