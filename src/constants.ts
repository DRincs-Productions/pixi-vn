import { PauseType, RepeatType } from "./types"

export const PIXIVN_VERSION = '0.6.9'
export const Repeat: RepeatType = "repeat"
/**
 * Pause the tickers for a duration.
 * @param duration Duration in seconds
 * @returns The pause object
 */
export function Pause(duration: number): PauseType {
    return {
        type: "pause",
        duration: duration,
    }
}
