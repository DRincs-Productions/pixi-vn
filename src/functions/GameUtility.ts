import { GameStepManager, GameStorageManager, canvas, sound } from "../managers";

/**
 * Clear all game data. This function is used to reset the game.
 */
export function clearAllGameDatas() {
    GameStorageManager.clear();
    canvas.clear();
    sound.clear();
    GameStepManager.clear();
}