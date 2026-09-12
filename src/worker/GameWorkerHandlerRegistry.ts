export type GameWorkerHandler = (payload: unknown) => unknown | Promise<unknown>;

/**
 * Worker-side registry for `"custom"` request handlers - the extension point that lets a
 * third-party library built on top of Pixi'VN (e.g. one with `@drincs/pixi-vn` as a peer
 * dependency) share the same game-provided Worker instead of needing one of its own.
 *
 * A one-time, side-effecting call from the library's own worker-side module, e.g.:
 *
 * ```ts
 * // my-pixi-vn-plugin/worker.ts
 * import { registerGameWorkerHandler } from "@drincs/pixi-vn/worker";
 *
 * registerGameWorkerHandler("my-plugin:heavy-computation", (payload) => {
 *     // pure, CPU-bound work only - no DOM/PixiJS/audio access here, same as Pixi'VN's own
 *     // "restore-diff"/"diff"/"clone" handlers.
 *     return doHeavyComputation(payload);
 * });
 * ```
 *
 * The game project then imports that module (alongside `@drincs/pixi-vn/worker`'s own
 * `handleGameWorkerMessage`) from whichever file it points its registered Worker's
 * `onmessage` at - see `handleGameWorkerMessage`'s doc comment for the full wiring. On the main
 * thread, the library calls it via `GameWorkerManager.custom(kind, payload)`.
 */
const handlers = new Map<string, GameWorkerHandler>();

/** Registers (or replaces) the worker-side handler for `kind`. See this file's doc comment. */
export function registerGameWorkerHandler(kind: string, handler: GameWorkerHandler): void {
    handlers.set(kind, handler);
}

/** Removes the worker-side handler previously registered for `kind`, if any. */
export function unregisterGameWorkerHandler(kind: string): void {
    handlers.delete(kind);
}

export function getGameWorkerHandler(kind: string): GameWorkerHandler | undefined {
    return handlers.get(kind);
}
