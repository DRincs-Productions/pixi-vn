/**
 * Base interface for audio filters/effects.
 * Concrete implementations use Tone.js effects.
 * This replaces the `Filter` class from `@pixi/sound`.
 */
export default interface AudioFilter {
    /** Discriminator tag used by {@link SoundFilterMemory} for serialization. */
    readonly filterType: string;
}
