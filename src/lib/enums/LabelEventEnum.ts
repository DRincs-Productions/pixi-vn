/**
 * Enumeration of label modes that occurred during the progression of the steps.
 */
export enum RunModeLabelEnum {
    OpenByCall = "openbycall",
    OpenByJump = "openbyjump",
}
/**
 * Enumeration of label events that occurred during the progression of the steps.
 */
export enum HistoryLabelEventEnum {
    End = "end",
    OpenByCall = RunModeLabelEnum.OpenByCall,
    OpenByJump = RunModeLabelEnum.OpenByJump,
    OpenMenu = "openmenu",
}
