import type NarrationManagerInterface from "@narration/interfaces/NarrationManagerInterface";
import NarrationManager from "@narration/NarrationManager";
export { newChoiceOption } from "@narration/classes/ChoiceMenuOption";
export { newCloseChoiceOption } from "@narration/classes/CloseChoiceOption";
export { default as Label } from "@narration/classes/Label";
export { default as LabelAbstract } from "@narration/classes/LabelAbstract";
export { default as newLabel } from "@narration/decorators/newLabel";
export { default as RegisteredLabels } from "@narration/decorators/RegisteredLabels";
export type { default as ChoiceInterface } from "@narration/interfaces/ChoiceInterface";
export type { default as DialogueInterface } from "@narration/interfaces/DialogueInterface";
export type { default as HistoryStep } from "@narration/interfaces/HistoryStep";
export type { default as LabelProps } from "@narration/interfaces/LabelProps";
export type { default as NarrationGameState } from "@narration/interfaces/NarrationGameState";
export type { default as NarrationHistory } from "@narration/interfaces/NarrationHistory";
export type { default as NarrationManagerInterface } from "@narration/interfaces/NarrationManagerInterface";
export type { default as OpenedLabel } from "@narration/interfaces/OpenedLabel";
export type { default as StepLabelProps } from "@narration/interfaces/StepLabelProps";
export type { default as StepLabelResult } from "@narration/interfaces/StepLabelResult";
export type {
    ChoiceOptionInterface,
    CloseChoiceOptionInterface,
    default as StoredChoiceInterface,
    StoredIndexedChoiceInterface,
} from "@narration/interfaces/StoredChoiceInterface";
export { default as NarrationManagerStatic } from "@narration/NarrationManagerStatic";
export type { default as HistoryChoiceMenuOption } from "@narration/types/HistoryChoiceMenuOption";
export type { InputInfo } from "@narration/types/InputInfo";
export type { LabelIdType, PixivnLabelIds } from "@narration/types/LabelIdType";
export type { default as LabelRunModeType } from "@narration/types/LabelRunModeType";
export type { default as LabelSteps } from "@narration/types/LabelSteps";
export type {
    StepLabelPropsType,
    StepLabelResultType,
    StepLabelType,
} from "@narration/types/StepLabelType";
export { narration };

const narration: NarrationManagerInterface = new NarrationManager();
