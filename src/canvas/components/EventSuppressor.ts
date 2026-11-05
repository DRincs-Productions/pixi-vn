/**
 * Anything that can emit an event with the given arguments, like a PixiJS container.
 */
export interface EventSuppressorTarget<
    Event extends string | symbol = string | symbol,
    Args extends unknown[] = unknown[],
> {
    emit(event: Event, ...args: Args): boolean;
}

/**
 * Emits the savable events of a canvas component (e.g. `"complete"` of an `AnimatedSprite`, `"ended"`
 * of a `VideoSprite`) and silences them while the component is loading or restoring a save, so the
 * listeners don't run again. Other events (e.g. pointer events) are not affected.
 *
 * Silencing is counted: nested and concurrent {@link run} calls keep the events silenced until the
 * last one finishes, even if one of them throws.
 *
 * @example
 * ```ts
 * class MyComponent extends Sprite {
 *     private readonly eventSuppressor = new EventSuppressor();
 *     protected onSomething() {
 *         this.eventSuppressor.emit(this, "something");
 *     }
 *     override async setMemory(memory: SpriteMemory) {
 *         await this.eventSuppressor.run(() => super.setMemory(memory));
 *     }
 * }
 * ```
 */
export class EventSuppressor {
    private _depth = 0;
    /**
     * `true` while at least one {@link run} call is in progress.
     */
    get silent(): boolean {
        return this._depth > 0;
    }
    /**
     * Run `fn` with the events silenced until it (and its returned promise) settles.
     * @returns The result of `fn`.
     */
    async run<T>(fn: () => Promise<T> | T): Promise<T> {
        this._depth++;
        try {
            return await fn();
        } finally {
            this._depth--;
        }
    }
    /**
     * Emit `event` on `target` with `args`, unless the events are silenced.
     * @returns `true` if the event was emitted.
     */
    emit<Event extends string | symbol, Args extends unknown[]>(
        target: EventSuppressorTarget<NoInfer<Event>, NoInfer<Args>>,
        event: Event,
        ...args: Args
    ): boolean {
        if (this.silent) {
            return false;
        }
        target.emit(event, ...args);
        return true;
    }
}
