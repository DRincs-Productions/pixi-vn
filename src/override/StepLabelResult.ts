/**
 * StepLabelResultType is the return type of the StepLabel function.
 * It can be useful for returning to the information calling function to perform other operations that cannot be performed within the StepLabel.
 * You can override this interface to add your own return types.
 * @example
 * ```typescript
 * // pixi-vn.types.ts
 * declare module '@drincs/pixi-vn/dist/override' {
 *     interface StepLabelResult {
 *         newRoute: string
 *     }
 * }
 * ```
 */
export default interface StepLabelResult {
    [key: string]: any
}
