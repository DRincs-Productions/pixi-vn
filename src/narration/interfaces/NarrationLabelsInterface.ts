import type { LabelAbstract, OpenedLabel } from "..";

export default interface NarrationLabelsInterface {
    /**
     * The stack of the opened labels.
     */
    readonly opened: OpenedLabel[];
    /**
     * currentLabel is the current label that occurred during the progression of the steps.
     */
    readonly current: LabelAbstract<any> | undefined;
    /**
     * Close the current label and add it to the history.
     */
    closeCurrent(): void;
    /**
     * Close all labels and add them to the history. **Attention: This method can cause an unhandled game ending.**
     */
    closeAll(): void;
}
