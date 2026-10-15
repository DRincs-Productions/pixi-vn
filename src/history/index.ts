import HistoryManager from "./HistoryManager";
import type HistoryManagerInterface from "./interfaces/HistoryManagerInterface";

export {
    default as HistoryManagerStatic,
    type HistoryGoBackModeType,
} from "./HistoryManagerStatic";
export type { default as HistoryGameState } from "./interfaces/HistoryGameState";
export type { default as HistoryManagerInterface } from "./interfaces/HistoryManagerInterface";
export { stepHistory };

/**
 * The global history manager instance. It records the narration steps (dialogues, choices, labels)
 * so the player can go back to previous steps and review what happened.
 */
const stepHistory: HistoryManagerInterface = new HistoryManager();
