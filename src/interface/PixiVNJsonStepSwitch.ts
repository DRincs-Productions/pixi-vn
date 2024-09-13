import PixiVNJsonConditionalResultToCombine from "./PixiVNJsonConditionalResultToCombine"
import PixiVNJsonConditionalStatements from "./PixiVNJsonConditionalStatements"

export type PixiVNJsonStepSwitchElementType<Then> = Then | PixiVNJsonConditionalStatements<Then> | PixiVNJsonConditionalResultToCombine<Then>
export type PixiVNJsonStepSwitchElementsType<Then> = (PixiVNJsonStepSwitchElementType<Then>)[] | PixiVNJsonConditionalStatements<Then[]>

interface PixiVNJsonRandom<Then> {
    type: "stepswitch",
    choiceType: "random",
    elements: PixiVNJsonStepSwitchElementsType<Then>
}
interface PixiVNJsonSequentialRandom<Then> {
    type: "stepswitch",
    choiceType: "sequentialrandom",
    elements: PixiVNJsonStepSwitchElementsType<Then>
    /**
     * When the sequential ends, what should be the value? If undefined, it will return undefined.
     * If "lastItem", it will return the last item in the array.
     */
    end: undefined | "lastItem"
    /**
     * The subId is used for manager nested switches
     */
    nestedId?: string
}
interface PixiVNJsonSequential<Then> {
    type: "stepswitch",
    choiceType: "sequential",
    elements: PixiVNJsonStepSwitchElementsType<Then>
    /**
     * When the sequential ends, what should be the value? If undefined, it will return undefined.
     * If "lastItem", it will return the last item in the array.
     */
    end: undefined | "lastItem"
    /**
     * The subId is used for manager nested switches
     */
    nestedId?: string
}
interface PixiVNJsonLoop<Then> {
    type: "stepswitch",
    choiceType: "loop",
    elements: PixiVNJsonStepSwitchElementsType<Then>
    nestedId?: string
}

type PixiVNJsonStepSwitch<Then> = PixiVNJsonRandom<Then> | PixiVNJsonSequential<Then> | PixiVNJsonLoop<Then> | PixiVNJsonSequentialRandom<Then>
export default PixiVNJsonStepSwitch
