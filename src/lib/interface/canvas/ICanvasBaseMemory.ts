/**
 * Interface for the canvas base memory
 */
export interface ICanvasBaseMemory {
    className: string,
    elements: ICanvasBaseMemory[],
    x: number,
    y: number,
    rotation: number,
    pivot: { x: number, y: number },
}
