import { TickerProgrationExponential, TickerProgrationLinear, TickerProgrationType } from "../interface";

/**
 * This function updates the progression of the ticker.
 * For example, if the speed of the ticker is 0.1 and the progression is 0.01, then the speed will be 0.11.
 * @param args The arguments that are passed to the ticker
 * @param propertyName The property name that will be updated 
 * @param progression The progression of the ticker
 * @param valueConvert The function that converts the amount and limit of progression
 * @returns 
 */
export function updateTickerProgression<T extends {}>(args: T, propertyName: keyof T, progression: TickerProgrationType): void {
    let { limit } = progression
    if (args[propertyName] === undefined
        || !progression
        || args[propertyName] === limit
    ) {
        return
    }
    if (typeof args[propertyName] === "number") {
        if (progression.type === "linear") {
            (args as any)[propertyName] = getLinearProgression(args[propertyName], progression)
        }
        else if (progression.type === "exponential") {
            (args as any)[propertyName] = getExponentialProgression(args[propertyName], progression)
        }
    }
    // args[propertyName] is { x: number, y: number }
    else if (
        args[propertyName] !== undefined &&
        typeof args[propertyName] === "object" &&
        (args as any)[propertyName].haveOwnProperty("x") &&
        (args as any)[propertyName].haveOwnProperty("y") &&
        typeof (args as any)[propertyName].x === "number" &&
        typeof (args as any)[propertyName].y === "number"
    ) {
        if (progression.type === "linear") {
            (args as any)[propertyName].x = getLinearProgression((args as any)[propertyName].x, progression);
            (args as any)[propertyName].y = getLinearProgression((args as any)[propertyName].y, progression)
        }
        else if (progression.type === "exponential") {
            (args as any)[propertyName].x = getExponentialProgression((args as any)[propertyName].x, progression);
            (args as any)[propertyName].y = getExponentialProgression((args as any)[propertyName].y, progression)
        }
    }
}

function getLinearProgression(number: number, progression: TickerProgrationLinear): number {
    let { limit, amt } = progression
    if (limit !== undefined) {
        if (number > limit && amt > 0) {
            return limit
        }
        else if (number < limit && amt < 0) {
            return limit
        }
    }
    return number + amt
}

function getExponentialProgression(number: number, progression: TickerProgrationExponential): number {
    let { limit } = progression
    if (limit !== undefined) {
        if (number > limit && progression.percentage > 0) {
            return limit
        }
        else if (number < limit && progression.percentage < 0) {
            return limit
        }
    }
    return number + number * progression.percentage
}
