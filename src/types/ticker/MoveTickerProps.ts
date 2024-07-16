import { TickerProgrationType } from "../../interface"

export type MoveTickerProps = {
    /**
     * The speed of the movement
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
