import { StepLabelProps, StepLabelResult } from "@drincs/pixi-vn";

/**
 * Result of a {@link StepLabelType} execution.
 *
 * - `StepLabelResult`: a structured result consumed by the narration engine.
 * - `void`: the step completed without returning an explicit result.
 * - `string`: a simple token or message interpreted by higher-level logic.
 *
 * Prefer returning a well-typed {@link StepLabelResult} for anything that
 * needs to be consumed programmatically. Use plain strings only where a
 * lightweight, convention-based signal is sufficient and clearly documented
 * by the surrounding game logic.
 */
export type StepLabelResultType = StepLabelResult | void | string;
export type StepLabelPropsType<T extends {} = {}> = StepLabelProps & T;

/**
 * StepLabel is a function that will be executed as the game continues.
 */
export type StepLabelType<T extends {} = {}> = (
    props: StepLabelPropsType<T>,
    info: {
        /**
         * The id of the label.
         */
        labelId: string;
    }
) => StepLabelResultType | Promise<StepLabelResultType>;
