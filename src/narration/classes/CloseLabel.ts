import Label from "./Label";

export const CLOSE_LABEL_ID = "__close-label-id__";

/**
 * CloseLabel is a label used for closing the menu.
 * @deprecated
 */
export default function newCloseLabel<T extends {} = {}>() {
    return new Label<T>(CLOSE_LABEL_ID, [], {});
}
