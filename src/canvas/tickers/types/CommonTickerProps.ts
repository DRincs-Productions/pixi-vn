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
};
