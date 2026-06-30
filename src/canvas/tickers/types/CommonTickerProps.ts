import { narration } from "../../..";
export type CommonTickerProps = {
    /**
     * An array of strings containing the aliases of the canvas components to remove after the animation completes.
     * @default []
     */
    aliasToRemoveAfter?: string[] | string;
    /**
     * If true, the effect only starts if the canvas element have a texture
     * @default false
     */
    startOnlyIfHaveTexture?: boolean;
    /**
     * If you want to resume tickers that were previously paused, provide the aliases of the canvas components whose tickers should be resumed.
     * @default []
     */
    tickerAliasToResume?: string[] | string;
    /**
     * A string containing the ticker ID to resume after the animation completes.
     * @default []
     */
    tickerIdToResume?: string[] | string;
    /**
     * @deprecated Use {@link completeOnContinue} instead.
     */
    forceCompleteBeforeNext?: boolean;
    /**
     * A boolean indicating whether the animation must complete before the next `step` of the game. If `true`, the game will force the animation to finish before proceeding.
     * When true, calling {@link narration.continue()} forces the current content to complete before advancing to the next narrative step.
     * @default false
     */
    completeOnContinue?: boolean;
};
