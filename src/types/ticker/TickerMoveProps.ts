import { TickerProgrationType } from "../../interface"

export type TickerMoveProps = {
    /**
     * The speed of the movement in pixels per second
     * @default 1
     */
    speed?: number | { x: number, y: number }
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
