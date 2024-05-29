import Label from "./Label"

export const CLOSE_LABEL_ID = "__close-label-id__"

/**
 * CloseLabel is a label used for closing the menu.
 */
export default function newCloseLabel(choiseIndex?: number) { return new Label(CLOSE_LABEL_ID, [], undefined, choiseIndex) }
