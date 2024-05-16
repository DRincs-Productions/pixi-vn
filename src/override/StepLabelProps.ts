/**
 * StepLabelPropsType is the type of the props that will be passed to the StepLabel.
 * You can override this interface to add your own props.
 * @example
 * ```typescript
 * // pixi-vn.types.ts
 * declare module '@drincs/pixi-vn/dist/override' {
 *     interface StepLabelProps {
 *         navigate: (route: string) => void
 *     }
 * }
 * ```
 */
export default interface StepLabelProps {
    [key: string]: any
}
