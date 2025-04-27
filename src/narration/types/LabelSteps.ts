import { StepLabelType } from "./StepLabelType";

type LabelSteps<T extends {}> = [StepLabelType<T>, ...StepLabelType<Partial<T>>[]];
export default LabelSteps;
