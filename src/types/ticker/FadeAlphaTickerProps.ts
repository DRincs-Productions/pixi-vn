export type FadeAlphaTickerProps = {
    /**
     * @deprecated use speed instead
     * @default 1
     */
    duration?: number
    /**
     * The speed of the effect
     * @default 1
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
}