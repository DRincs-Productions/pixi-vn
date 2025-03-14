/**
 * StepLabelPropsType is the type of the props that will be passed to the StepLabel.
 * You can override this interface to add your own props.
 * @example
 * ```typescript
 * // pixi-vn.d.ts
 * declare module '@drincs/pixi-vn' {
 *     interface StepLabelProps {
 *         navigate: (route: string) => void,
 *         [key: string]: any
 *     }
 * }
 * ```
 */
export default interface StepLabelProps {}
