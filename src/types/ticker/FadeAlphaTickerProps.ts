export type FadeAlphaTickerProps = {
    /**
     * The duration of the fade, in seconds.
     * in reality the duration is not exactly in seconds because it is based on the frame rate of the game.
     * @default 1
     */
    duration?: number
    /**
     * The type of the fade
     * @default "hide"
     */
    type?: "hide" | "show"
    /**
     * The limit of the fade
     * @default type === "hide" ? 0 : 1
     */
    limit?: number
    /**
     * The alias to remove after the fade is done
     * @default []
     */
    tagToRemoveAfter?: string[] | string
    /**
     * If true, the effect only starts if the canvas element have a texture
     * @default false
     */
    startOnlyIfHaveTexture?: boolean
}