import { StepLabelProps, StepLabelResult } from '@drincs/pixi-vn/dist/override';

export type StepLabelResultType = StepLabelResult | void
export type StepLabelPropsType<T extends {} = {}> = StepLabelProps & T

/**
 * StepLabel is a function that will be executed as the game continues.
 */
export type StepLabelType<T extends {} = {}> = ((props: StepLabelPropsType<T>, info: {
    /**
     * The id of the label.
     */
    labelId: string
}) => StepLabelResultType | Promise<StepLabelResultType>)
