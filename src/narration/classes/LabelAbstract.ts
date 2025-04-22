import RegisteredLabels from "../decorators/RegisteredLabels";
import LabelProps from "../interfaces/LabelProps";
import { LabelIdType } from "../types/LabelIdType";
import { StepLabelType } from "../types/StepLabelType";

export default abstract class LabelAbstract<TLabel, TProps extends {} = {}, StepIdType = number>
    implements LabelProps<TLabel, StepIdType>
{
    /**
     * @param id is the id of the label
     * @param props is the properties of the label
     */
    constructor(id: LabelIdType, props?: LabelProps<TLabel, StepIdType>) {
        this._id = id;
        this._onStepStart = props?.onStepStart;
        this._onLoadingLabel = props?.onLoadingLabel;
        this._onStepEnd = props?.onStepEnd;
    }

    private _id: LabelIdType;
    /**
     * Get the id of the label. This variable is used in the system to get the label by id, {@link RegisteredLabels.get}
     */
    public get id(): LabelIdType {
        return this._id;
    }

    /**
     * Get the number of steps in the label. This variable is used in the system to get the number of steps in the label.
     * @returns The number of steps in the label
     */
    public abstract get stepCount(): number;

    /**
     * Get the sha of the step
     * @param index Index of the step
     */
    public abstract getStepSha(stepId: StepIdType): string | undefined;

    /**
     * Get the step by id
     * @param stepId Id of the step
     * @return The step or undefined if it does not exist
     */
    public abstract getStepById(stepId: StepIdType): StepLabelType<TProps> | undefined;

    private _onStepStart: ((stepId: StepIdType, label: TLabel) => void | Promise<void>) | undefined;
    public get onStepStart(): ((stepId: StepIdType, label: TLabel) => void | Promise<void>) | undefined {
        return async (stepId: StepIdType, label: TLabel) => {
            if (this._onLoadingLabel && stepId === 0) {
                await this._onLoadingLabel(stepId, label);
            }
            if (this._onStepStart) {
                return await this._onStepStart(stepId, label);
            }
        };
    }

    private _onLoadingLabel: ((stepId: StepIdType, label: TLabel) => void | Promise<void>) | undefined;
    public get onLoadingLabel(): ((stepId: StepIdType, label: TLabel) => void | Promise<void>) | undefined {
        return this._onLoadingLabel;
    }

    private _onStepEnd: ((stepId: StepIdType, label: TLabel) => void | Promise<void>) | undefined;
    public get onStepEnd(): ((stepId: StepIdType, label: TLabel) => void | Promise<void>) | undefined {
        return this._onStepEnd;
    }
}
