export type TickerFadeAlphaProps = {
    /**
     * The duration of the fade, in seconds.
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
     * The tag to remove after the fade is done
     * @default []
     */
    tagToRemoveAfter?: string[] | string
    /**
     * If true, the fade only starts if the canvas element have a texture
     * @default false
     */
    startOnlyIfHaveTexture?: boolean
}