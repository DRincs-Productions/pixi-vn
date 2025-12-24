import { StepLabelProps, StepLabelResult } from "@drincs/pixi-vn";

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
