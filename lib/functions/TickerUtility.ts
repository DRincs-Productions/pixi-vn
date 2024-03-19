import { TickerProgrationType } from "../interface/ITickerProgration"

/**
 * This function updates the progression of the ticker.
 * For example, if the speed of the ticker is 0.1 and the progression is 0.01, then the speed will be 0.11.
 * @param args The arguments that are passed to the ticker
 * @param propertyName The property name that will be updated 
 * @param progression The progression of the ticker
 * @returns 
 */
export function updateTickerProgression(args: any, propertyName: string, progression: TickerProgrationType) {
    if (args.hasOwnProperty(propertyName) && typeof args[propertyName] !== "number") {
        return
    }
    if (args[propertyName] !== undefined
        && progression
        && args[propertyName] !== progression.limit
    ) {
        if (progression.type === "linear") {
            args[propertyName] += progression.amt
            if (progression.limit !== undefined) {
                if (args[propertyName] > progression.limit && progression.amt > 0) {
                    args[propertyName] = progression.limit
                }
                else if (args[propertyName] < progression.limit && progression.amt < 0) {
                    args[propertyName] = progression.limit
                }
            }
        }
        else if (progression.type === "exponential") {
            args[propertyName] += args[propertyName] * progression.percentage
            if (progression.limit !== undefined) {
                if (args[propertyName] > progression.limit && progression.percentage > 0) {
                    args[propertyName] = progression.limit
                }
                else if (args[propertyName] < progression.limit && progression.percentage < 0) {
                    args[propertyName] = progression.limit
                }
            }
        }
    }
}
