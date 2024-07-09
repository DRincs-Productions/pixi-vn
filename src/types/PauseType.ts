export const PauseValueType = "pause"
export type PauseType = {
    /**
     * The type of the value
     */
    type: typeof PauseValueType,
    /**
     * Duration in seconds
     */
    duration: number,
}
/**
 * Pause the tickers for a duration.
 * @param duration Duration in seconds
 * @returns The pause object
 */
export function Pause(duration: number): PauseType {
    return {
        type: PauseValueType,
        duration: duration,
    }
}