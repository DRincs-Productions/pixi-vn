import { StepLabelProps, StepLabelResult } from "@drincs/pixi-vn";

/**
 * Result of a {@link StepLabelType} execution.
 *
 * - `StepLabelResult`: a structured result consumed by the narration engine.
 * - `void`: the step completed without returning an explicit result.
 * - `string`: a shorthand form for simple results, such as navigation targets
 *   or status tokens. The exact meaning of the string is defined by the
 *   caller; for example, some consumers may treat it as a label identifier
 *   to jump to.
 *
 * When introducing new usages that return a `string`, document the accepted
 * values and their semantics in the corresponding StepLabel implementation
 * so that callers and maintainers can reliably interpret the result.
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
