import { GameHistoryManager } from "../managers/HistoryManager";
import { GameStorageManager } from "../managers/StorageManager";
import { GameWindowManager } from "../managers/WindowManager";

export function clearAllGameDatas() {
    GameStorageManager.clear();
    GameWindowManager.removeChildren();
    GameHistoryManager.clear();
}