import sha1 from "crypto-js/sha1";
import type { LabelProps } from "../..";
import { logger } from "../../utils/log-utility";
import { AdditionalShaSpetsEnum } from "../interfaces/HistoryStep";
import type { LabelIdType } from "../types/LabelIdType";
import type { StepLabelType } from "../types/StepLabelType";
import LabelAbstract from "./LabelAbstract";

/**
 * Label is a class that contains a list of steps, which will be performed as the game continues.
 * For Ren'py this is the equivalent of a label.
 * @example
 * ```ts
 * const START_LABEL_ID = "StartLabel"
 *
 * export const startLabel = newLabel(START_LABEL_ID,
 *     [
 *         (props) => {
 *             canvas.clear()
 *             narration.dialogue = { character: liam, text: "Which test do you want to perform?" }
 *             narration.choices = [
 *                 newChoiceOption("Events Test", eventsTestLabel),
 *                 newChoiceOption("Show Image Test", showImageTest),
 *             ]
 *         },
 *         (props) => narration.jump(START_LABEL_ID, props),
 *     ]
 * )
 *
 * narration.call(StartLabel)
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
    constructor(
        id: LabelIdType,
        steps: StepLabelType<T>[] | (() => StepLabelType<T>[]),
        props?: LabelProps<Label<T>>,
    ) {
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
        const steps = this.steps;
        if (index < 0 || index >= steps.length) {
            // For generator-function labels the step array can change between calls when
            // game state is mutated inside a step (e.g. setting a flag that the generator
            // branches on).  An out-of-bounds index is therefore expected during those
            // intermediate states and does not indicate a bug.  Only warn for static labels.
            if (typeof this._steps !== "function") {
                logger.warn("stepSha not found, setting to ERROR");
            }
            return AdditionalShaSpetsEnum.ERROR;
        }
        try {
            const sha1String = sha1(steps[index].toString().toLocaleLowerCase());
            return sha1String.toString();
        } catch (e) {
            logger.warn("stepSha not found, setting to ERROR", e);
            return AdditionalShaSpetsEnum.ERROR;
        }
    }
}
