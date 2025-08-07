export type CommonTickerProps = {
    /**
     * The alias to remove after the effect is done
     * @default []
     */
    aliasToRemoveAfter?: string[] | string;
    /**
     * If true, the effect only starts if the canvas element have a texture
     * @default false
     */
    startOnlyIfHaveTexture?: boolean;
    /**
     * The alias to resume after the effect is done
     * @default []
     */
    tickerAliasToResume?: string[] | string;
    /**
     * The id of the ticker to resume after the effect is done
     * @default []
     */
    tickerIdToResume?: string[] | string;
    /**
     * If set to `true`, the game will force the animation to complete before moving to the next step.
     * @default false
     */
    forceCompleteBeforeNext?: boolean;
};
