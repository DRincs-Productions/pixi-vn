import Label from "./Label"

export const CLOSE_LABEL_ID = "__close-label-id__"

/**
 * CloseLabel is a label used for closing the menu.
 */
export default class CloseLabel extends Label {
    constructor(choiseIndex?: number) {
        super(CLOSE_LABEL_ID, [], undefined, choiseIndex)
    }
}
