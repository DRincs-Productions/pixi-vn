/**
 * StepLabel is a function that will be executed as the game continues.
 */
export type StepLabelType = (() => StepLabelResultType | Promise<StepLabelResultType>)

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
} | void
