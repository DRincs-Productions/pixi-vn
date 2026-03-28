/**
 * Interface for the canvas base memory
 */
export default interface CanvasBaseItemMemory {
    pixivnId: string;
    /**
     * The index of the container in its parent, if it has one
     */
    index?: number;
    /**
     * The label of the parent container, if it has one
     */
    parentLabel?: string;
    label?: string;
    zIndex?: number;
}
