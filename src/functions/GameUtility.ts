import { canvas, narration, sound, storage } from "../managers";

/**
 * Clear all game data. This function is used to reset the game.
 */
export function clearAllGameDatas() {
    storage.clear();
    canvas.clear();
    sound.clear();
    narration.clear();
}