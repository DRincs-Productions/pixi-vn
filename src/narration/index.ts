import { NarrationManagerInterface } from "..";
import NarrationManager from "./NarrationManager";

export { default as ChoiceMenuOption, ChoiceMenuOptionClose } from "./classes/ChoiceMenuOption";
export {
    default as Dialogue,
    /**
     *  @deprecated use "import { Dialogue } from '@drincs/pixi-vn';"
     */
    default as DialogueBaseModel,
} from "./classes/Dialogue";
export { default as Label } from "./classes/Label";
export { default as LabelAbstract } from "./classes/LabelAbstract";
export { getLabelById, newLabel, saveLabel } from "./decorators/label-decorator";
export type { default as ExportedStep } from "./interfaces/ExportedStep";
export type { default as HistoryStep, HistoryStepData } from "./interfaces/HistoryStep";
export type { default as LabelProps } from "./interfaces/LabelProps";
export type { default as NarrationManagerInterface } from "./interfaces/NarrationManagerInterface";
export type { default as NarrativeHistory } from "./interfaces/NarrativeHistory";
export type { default as OpenedLabel } from "./interfaces/OpenedLabel";
export type { default as StepLabelProps } from "./interfaces/StepLabelProps";
export type { default as StepLabelResult } from "./interfaces/StepLabelResult";
export { default as NarrationManagerStatic } from "./NarrationManagerStatic";
export { narration };

const narration: NarrationManagerInterface = new NarrationManager();
