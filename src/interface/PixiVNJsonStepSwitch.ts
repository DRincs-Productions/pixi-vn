import PixiVNJsonConditionalStatements from "./PixiVNJsonConditionalStatements"

interface PixiVNJsonRandom<Then> {
    type: "stepswitch",
    choiceType: "random",
    elements: (Then | PixiVNJsonConditionalStatements<Then>)[] | PixiVNJsonConditionalStatements<Then[]>
}
interface PixiVNJsonSequential<Then> {
    type: "stepswitch",
    choiceType: "sequential",
    elements: (Then | PixiVNJsonConditionalStatements<Then>)[] | PixiVNJsonConditionalStatements<Then[]>
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
    elements: (Then | PixiVNJsonConditionalStatements<Then>)[] | PixiVNJsonConditionalStatements<Then[]>
    nestedId?: string
}

type PixiVNJsonStepSwitch<Then> = PixiVNJsonRandom<Then> | PixiVNJsonSequential<Then> | PixiVNJsonLoop<Then>
export default PixiVNJsonStepSwitch
