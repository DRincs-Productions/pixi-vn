import { TickerProgrationType } from "../interface/ITickerProgration"

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
