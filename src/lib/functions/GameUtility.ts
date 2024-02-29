import { GameStepManager } from "../managers/StepManager";
import { GameStorageManager } from "../managers/StorageManager";
import { GameWindowManager } from "../managers/WindowManager";

/**
 * Clear all game data. This function is used to reset the game.
 */
export function clearAllGameDatas() {
    GameStorageManager.clear();
    GameWindowManager.clear();
    GameStepManager.clear();
}