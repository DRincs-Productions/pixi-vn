import { LabelIdType } from "./LabelIdType";
import StepLabelJsonType from "./StepLabelJsonType";

/**
 * Label JSON type
 */
type LabelJsonType = { [labelId: LabelIdType]: StepLabelJsonType[] }

export default LabelJsonType
