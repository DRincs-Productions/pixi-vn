import { NarrationManagerInterface } from "..";
import NarrationManager from "./NarrationManager";

export { default as ChoiceMenuOption } from "./classes/ChoiceMenuOption";
export { default as ChoiceMenuOptionClose } from "./classes/ChoiceMenuOptionClose";
export { default as Label } from "./classes/Label";
export { default as LabelAbstract } from "./classes/LabelAbstract";
export { default as newLabel } from "./decorators/newLabel";
export { default as RegisteredLabels } from "./decorators/RegisteredLabels";
export type { default as ChoiceInterface } from "./interfaces/ChoiceInterface";
export type { default as DialogueInterface } from "./interfaces/DialogueInterface";
export type { default as HistoryStep } from "./interfaces/HistoryStep";
export type { default as LabelProps } from "./interfaces/LabelProps";
export type { default as NarrationGameState } from "./interfaces/NarrationGameState";
export type { default as NarrationManagerInterface } from "./interfaces/NarrationManagerInterface";
export type { default as NarrativeHistory } from "./interfaces/NarrativeHistory";
export type { default as OpenedLabel } from "./interfaces/OpenedLabel";
export type { default as StepLabelProps } from "./interfaces/StepLabelProps";
export type { default as StepLabelResult } from "./interfaces/StepLabelResult";
export type {
    default as StoredChoiceInterface,
    StoredIndexedChoiceInterface,
} from "./interfaces/StoredChoiceInterface";
export { default as NarrationManagerStatic } from "./NarrationManagerStatic";
export { Close } from "./types/CloseType";
export type { CloseType } from "./types/CloseType";
export type { default as HistoryChoiceMenuOption } from "./types/HistoryChoiceMenuOption";
export type { InputInfo } from "./types/InputInfo";
export type { default as LabelRunModeType } from "./types/LabelRunModeType";
export type { default as LabelSteps } from "./types/LabelSteps";
export type { StepLabelPropsType, StepLabelResultType, StepLabelType } from "./types/StepLabelType";
export { narration };

const narration: NarrationManagerInterface = new NarrationManager();
