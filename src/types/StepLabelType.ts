import { StepLabelProps, StepLabelResult } from '@drincs/pixi-vn/dist/override';
import { StorageElementType } from './StorageElementType';

export type StepLabelResultType = StepLabelResult | void
export type StepLabelPropsType<T extends {} | StorageElementType = {}> = StepLabelProps & T

/**
 * StepLabel is a function that will be executed as the game continues.
 */
export type StepLabelType<T extends {} | StorageElementType = {}> = ((props?: StepLabelPropsType<T>) => StepLabelResultType | Promise<StepLabelResultType>)
