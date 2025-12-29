import { StepLabelProps, StepLabelResult } from "@drincs/pixi-vn";

/**
 * Result of a {@link StepLabelType} execution.
 *
 * - `StepLabelResult`: a structured result consumed by the narration engine.
 * - `void`: the step completed without returning an explicit result.
 *
 * Returning arbitrary strings from step labels is intentionally not supported
 * by this type. If you need to signal additional information, extend
 * `StepLabelResult` with a more specific, well-typed structure instead of
 * using untyped string tokens.
 */
export type StepLabelResultType = StepLabelResult | void;
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
