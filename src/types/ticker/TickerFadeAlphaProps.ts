export type TickerFadeAlphaProps = {
    /**
     * The speed of the fade
     */
    speed?: number
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
     * The tag to remove after the fade is done
     */
    tagToRemoveAfter?: string[] | string
    /**
     * If true, the fade only starts if the canvas element have a texture
     */
    startOnlyIfHaveTexture?: boolean
}