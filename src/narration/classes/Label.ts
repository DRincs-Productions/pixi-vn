import sha1 from "crypto-js/sha1";
import { LabelProps } from "../..";
import { logger } from "../../utils/log-utility";
import { AdditionalShaSpetsEnum } from "../interfaces/HistoryStep";
import { LabelIdType } from "../types/LabelIdType";
import { StepLabelType } from "../types/StepLabelType";
import LabelAbstract from "./LabelAbstract";

/**
 * Label is a class that contains a list of steps, which will be performed as the game continues.
 * For Ren'py this is the equivalent of a label.
 * @example
 * ```typescript
 * const START_LABEL_ID = "StartLabel"
 *
 * export const startLabel = newLabel(START_LABEL_ID,
 *     [
 *         (props) => {
 *             canvas.clear()
 *             narration.dialogue = { character: liam, text: "Which test do you want to perform?" }
 *             narration.choiceMenuOptions = [
 *                 newChoiceOption("Events Test", eventsTestLabel),
 *                 newChoiceOption("Show Image Test", showImageTest),
 *             ]
 *         },
 *         (props) => narration.jumpLabel(START_LABEL_ID, props),
 *     ]
 * )
 *
 * narration.callLabel(StartLabel)
 * ```
 */
export default class Label<T extends {} = {}> extends LabelAbstract<Label<T>, T> {
    public get stepCount(): number {
        return this.steps.length;
    }
    public getStepById(stepId: number): StepLabelType<T> | undefined {
        return this.steps[stepId];
    }
    /**
     * @param id is the id of the label
     * @param steps is the list of steps that the label will perform
     * @param props is the properties of the label
     */
    constructor(id: LabelIdType, steps: StepLabelType<T>[] | (() => StepLabelType<T>[]), props?: LabelProps<Label<T>>) {
        super(id, props);
        this._steps = steps;
    }

    private _steps: StepLabelType<T>[] | (() => StepLabelType<T>[]);
    /**
     * Get the steps of the label.
     */
    public get steps(): StepLabelType<T>[] {
        if (typeof this._steps === "function") {
            return this._steps();
        }
        return this._steps;
    }

    public getStepSha(index: number): string {
        if (index < 0 || index >= this.steps.length) {
            logger.warn("stepSha not found, setting to ERROR");
            return AdditionalShaSpetsEnum.ERROR;
        }
        try {
            let step = this.steps[index];
            let sha1String = sha1(step.toString().toLocaleLowerCase());
            return sha1String.toString();
        } catch (e) {
            logger.warn("stepSha not found, setting to ERROR", e);
            return AdditionalShaSpetsEnum.ERROR;
        }
    }
}
