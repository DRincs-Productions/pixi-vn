import type GameState from "./GameState";

/**
 * Handler registered with `Game.addOnExportGameState`. It receives the complete save-state object
 * built by `Game.exportGameState` and can mutate it (e.g. add custom properties declared through
 * {@link GameState} module augmentation) before it is returned to the caller.
 */
export type OnExportGameStateHandler = (state: GameState) => void | Promise<void>;

/**
 * Handler registered with `Game.addOnRestoreGameState`. It receives the exact save-state object
 * passed to `Game.restoreGameState`, so an external library can read back the data it added
 * during export.
 */
export type OnRestoreGameStateHandler = (state: GameState) => void | Promise<void>;

/**
 * When a {@link OnRestoreGameStateHandler} runs relative to the built-in restoration:
 * - `"before"`: before any built-in module (history, narration, storage, canvas, sound) is restored.
 * - `"after"`: after every built-in module has been restored and navigation has completed.
 */
export type GameStateHookTiming = "before" | "after";

/**
 * Options for `Game.addOnRestoreGameState`.
 */
export interface OnRestoreGameStateOptions {
    /**
     * When the handler runs relative to the built-in restoration.
     * @default "before"
     */
    timing?: GameStateHookTiming;
}
