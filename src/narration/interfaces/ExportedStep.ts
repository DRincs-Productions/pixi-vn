import HistoryStep, { HistoryStepData } from "./HistoryStep";
import OpenedLabel from "./OpenedLabel";

/**
 * Interface exported step data
 */
export default interface ExportedStep {
    stepsHistory: HistoryStep[];
    openedLabels: OpenedLabel[];
    lastStepIndex: number;
    originalStepData: HistoryStepData | undefined;
}
