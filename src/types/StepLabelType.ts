import { StepLabelProps, StepLabelResult } from '@drincs/pixi-vn/dist/override';

export type StepLabelResultType = StepLabelResult | void
export type StepLabelPropsType = StepLabelProps

/**
 * StepLabel is a function that will be executed as the game continues.
 */
export type StepLabelType = ((props?: StepLabelPropsType) => StepLabelResultType | Promise<StepLabelResultType>)
