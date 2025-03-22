import HistoryManager from "./HistoryManager";
import HistoryManagerInterface from "./interfaces/HistoryManagerInterface";

export { default as HistoryManagerStatic } from "./HistoryManagerStatic";
export type { default as HistoryManagerInterface } from "./interfaces/HistoryManagerInterface";
export { history as narration };

const history: HistoryManagerInterface = new HistoryManager();
