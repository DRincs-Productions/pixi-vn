/**
 * Serializable representation of a single `Filter` attached to a canvas element's `.filters` array.
 *
 * A live `Filter` instance (PixiJS's own, like `BlurFilter`, or a custom one) generally can't be
 * serialized directly - it doesn't expose its constructor options after creation, and its state lives in
 * GPU-facing resources/uniform groups. `filterId` identifies which registration (see
 * {@link filterDecorator}/{@link RegisteredFilters}) knows how to convert it to and from `args`.
 */
export default interface FilterMemory {
    /**
     * The id the filter's class was registered under. Used on restore to look up the class and
     * reconstruct an instance from `args`.
     */
    filterId: string;
    /**
     * The serializable arguments needed to reconstruct the filter, as produced by its registration's
     * `toMemory` function.
     */
    args: any;
}
