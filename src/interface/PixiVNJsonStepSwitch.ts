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
    end: undefined | "lastItem"
}
interface PixiVNJsonLoop<Then> {
    type: "stepswitch",
    choiceType: "loop",
    elements: (Then | PixiVNJsonConditionalStatements<Then>)[] | PixiVNJsonConditionalStatements<Then[]>
}

type PixiVNJsonStepSwitch<Then> = PixiVNJsonRandom<Then> | PixiVNJsonSequential<Then> | PixiVNJsonLoop<Then>
export default PixiVNJsonStepSwitch
