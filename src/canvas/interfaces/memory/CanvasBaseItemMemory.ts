import type { FilterMemory } from "@drincs/pixi-vn/filters";

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
    /**
     * The filters applied to this element, if any - kept separate from the real, live `Filter[]`
     * `.filters` (inherited from the PixiJS options types this memory interface also extends) since a
     * memory object is serialized data, not construction options. Only filters registered with
     * {@link filterDecorator}/{@link RegisteredFilters} can be saved - any other `Filter` instance found
     * on `.filters` is skipped (with a warning) when exporting.
     */
    pixivnFilters?: FilterMemory[];
}
