export interface PauseType {
    type: "Pause",
    ticker: "Pause",
    duration: number,
}
export function Pause(duration: number): PauseType {
    return {
        type: "Pause",
        ticker: "Pause",
        duration: duration,
    }
}