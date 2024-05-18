import { StepLabelProps, StepLabelResult } from '@drincs/pixi-vn/dist/override';
import { StorageObjectType } from './StorageElementType';

export type StepLabelResultType = StepLabelResult | void
export type StepLabelPropsType<T extends {} | StorageObjectType = {}> = StepLabelProps & T

/**
 * StepLabel is a function that will be executed as the game continues.
 */
export type StepLabelType<T extends {} | StorageObjectType = {}> = ((props?: StepLabelPropsType<T>) => StepLabelResultType | Promise<StepLabelResultType>)
