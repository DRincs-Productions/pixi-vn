import { GameStepManager, GameStorageManager, GameWindowManager } from "../managers";

/**
 * Clear all game data. This function is used to reset the game.
 */
export function clearAllGameDatas() {
    GameStorageManager.clear();
    GameWindowManager.clear();
    GameStepManager.clear();
}