import { StepLabelProps, StepLabelResult } from "@drincs/pixi-vn";

/**
 * Result of a {@link StepLabelType} execution.
 *
 * - `StepLabelResult`: a structured result consumed by the narration engine.
 * - `void`: the step completed without returning an explicit result.
 * - `string`: a shorthand form for simple results, such as status tokens or
 *   other lightweight signals. The exact meaning of the string is defined by
 *   the caller or consuming system and is not interpreted by this type
 *   definition itself.
 *
 * When introducing usages that return a `string`, document the accepted
 * values and their semantics in the corresponding StepLabel implementation
 * (or in the consuming system) so that callers and maintainers can reliably
 * interpret the result.
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
