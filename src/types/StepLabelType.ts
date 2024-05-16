/**
 * StepLabelPropsType is the type of the props that will be passed to the StepLabel.
 */
export type StepLabelPropsType = {
    /**
     * the function that will be executed for navigate to another route.
     * @param route 
     * @returns 
     */
    navigateTo?: (route: string) => void,
    [key: string]: any
}
/**
 * StepLabelResultType is the return type of the StepLabel function.
 * It can be useful for returning to the information calling function to perform other operations that cannot be performed within the StepLabel.
 */
export type StepLabelResultType = {
    /**
     * The new route to navigate to.
     */
    newRoute?: string,
    [key: string]: any
} | void | any

/**
 * StepLabel is a function that will be executed as the game continues.
 */
export type StepLabelType = ((props: StepLabelPropsType) => StepLabelResultType | Promise<StepLabelResultType>)
