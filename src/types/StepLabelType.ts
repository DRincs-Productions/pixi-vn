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
 * StepLabel is a function that will be executed as the game continues.
 */
export type StepLabelType = ((props: StepLabelPropsType) => any | Promise<any>)
