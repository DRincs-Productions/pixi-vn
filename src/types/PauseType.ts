export const PauseValueType = "pause"
export type PauseType = {
    type: typeof PauseValueType,
    duration: number,
}
export function Pause(duration: number): PauseType {
    return {
        type: PauseValueType,
        duration: duration,
    }
}