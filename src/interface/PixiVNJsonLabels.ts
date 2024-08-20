import PixiVNJsonLabelStep from "./PixiVNJsonLabelStep";

/**
 * Label of the narrative.
 */
export type PixiVNJsonLabel = PixiVNJsonLabelStep[]

/**
 * Collection of labels to be used in the narrative.
 */
type PixiVNJsonLabels = { [labelId: string]: PixiVNJsonLabel }

export default PixiVNJsonLabels
