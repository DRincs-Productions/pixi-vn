import HistoryManager from "./HistoryManager";
import HistoryManagerInterface from "./interfaces/HistoryManagerInterface";

export { default as HistoryManagerStatic } from "./HistoryManagerStatic";
export type { default as HistoryManagerInterface } from "./interfaces/HistoryManagerInterface";
export { stepHistory };

const stepHistory: HistoryManagerInterface = new HistoryManager();
