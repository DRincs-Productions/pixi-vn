/**
 * StepLabelPropsType is the type of the props that will be passed to the StepLabel.
 * You can override this interface to add your own props.
 * @example
 * ```typescript
 * // pixi-vn.types.ts
 * declare module '@drincs/pixi-vn/dist' {
 *     interface StepLabelProps {
 *         navigate: (route: string) => void
 *     }
 * }
 * ```
 */
export interface StepLabelProps {
    [key: string]: any
}

/**
 * StepLabelResultType is the return type of the StepLabel function.
 * It can be useful for returning to the information calling function to perform other operations that cannot be performed within the StepLabel.
 * You can override this interface to add your own return types.
 * @example
 * ```typescript
 * // pixi-vn.types.ts
 * declare module '@drincs/pixi-vn/dist' {
 *     interface StepLabelResult {
 *         newRoute: string
 *     }
 * }
 * ```
 */
export interface StepLabelResult {
    [key: string]: any
}

export type StepLabelResultType = StepLabelResult | void
export type StepLabelPropsType = StepLabelProps

/**
 * StepLabel is a function that will be executed as the game continues.
 */
export type StepLabelType = ((props: StepLabelPropsType) => StepLabelResultType | Promise<StepLabelResultType>)
