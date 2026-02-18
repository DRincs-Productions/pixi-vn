import { narration } from "../../..";
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
     * @deprecated Use {@link completeOnContinue} instead.
     */
    forceCompleteBeforeNext?: boolean;
    /**
     * When true, calling {@link narration.continue()} forces the current content to complete before advancing to the next narrative step.
     * @default false
     */
    completeOnContinue?: boolean;
};
