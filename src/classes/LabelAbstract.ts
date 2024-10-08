import { getLabelById } from "../decorators"
import { LabelProps } from "../interface"
import { LabelIdType } from "../types/LabelIdType"
import { StepLabelType } from "../types/StepLabelType"

export default abstract class LabelAbstract<TLabel, TProps extends {} = {}> {
    /**
     * @param id is the id of the label
     * @param props is the properties of the label
     */
    constructor(id: LabelIdType, props?: LabelProps<TLabel>) {
        this._id = id
        this._onStepStart = props?.onStepStart
        this._onLoadStep = props?.onLoadStep
        this._onStepEnd = props?.onStepEnd
        this._choiseIndex = props?.choiseIndex
    }

    private _id: LabelIdType
    /**
     * Get the id of the label. This variable is used in the system to get the label by id, {@link getLabelById}
     */
    public get id(): LabelIdType {
        return this._id
    }

    /**
     * Get the steps of the label.
     */
    public abstract get steps(): StepLabelType<TProps>[]

    /**
     * Get the sha1 of the step
     * @param index Index of the step
     */
    public abstract getStepSha1(index: number): string | undefined

    /**
     * Get the corresponding steps number
     * @param externalStepSha1
     * @returns Numer of corresponding steps, for example, if externalSteps is [ABC, DEF, GHI] and the steps of the label is [ABC, GHT], the result will be 1
     */
    protected getCorrespondingStepsNumber(externalStepSha1: string[]): number {
        if (externalStepSha1.length === 0) {
            return 0
        }
        let res: number = 0
        externalStepSha1.forEach((stepSha1, index) => {
            let sha1 = this.getStepSha1(index)
            if (sha1 === stepSha1) {
                res = index
            }
        })
        return res
    }

    private _onStepStart: ((stepIndex: number, label: TLabel) => void | Promise<void>) | undefined
    /**
     * Is a function that will be executed in {@link Label#onStepStart} and when the user goes back to it or when the user laods a save file.
     * @returns Promise<void> or void
     */
    public get onStepStart(): ((stepIndex: number, label: TLabel) => void | Promise<void>) | undefined {
        return async (stepIndex: number, label: TLabel) => {
            if (this._onLoadStep) {
                await this._onLoadStep(stepIndex, label)
            }
            if (this._onStepStart) {
                return await this._onStepStart(stepIndex, label)
            }
        }
    }

    private _onLoadStep: ((stepIndex: number, label: TLabel) => void | Promise<void>) | undefined
    /**
     * Get the function that will be executed a old step is reloaded. A step is reloaded when the user goes back to it or when the user laods a save file.
     * @returns Promise<void> or void
     */
    public get onLoadStep(): ((stepIndex: number, label: TLabel) => void | Promise<void>) | undefined {
        return this._onLoadStep
    }

    private _onStepEnd: ((stepIndex: number, label: TLabel) => void | Promise<void>) | undefined
    /**
     * Is a function that will be executed when the step ends.
     * @returns Promise<void> or void
     */
    public get onStepEnd(): ((stepIndex: number, label: TLabel) => void | Promise<void>) | undefined {
        return this._onStepEnd
    }

    private _choiseIndex: number | undefined
    public get choiseIndex(): number | undefined {
        return this._choiseIndex
    }
}
