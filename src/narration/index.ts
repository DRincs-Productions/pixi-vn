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
export { default as NarrationManagerStatic } from "./NarrationManagerStatic";
export { narration };

const narration: NarrationManagerInterface = new NarrationManager();
