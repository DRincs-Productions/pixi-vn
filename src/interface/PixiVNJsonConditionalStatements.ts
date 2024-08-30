import PixiVNJsonConditionalResultToCombine from "./PixiVNJsonConditionalResultToCombine"
import PixiVNJsonIfElse from "./PixiVNJsonIfElse"
import PixiVNJsonStepSwitch from "./PixiVNJsonStepSwitch"

type PixiVNJsonConditionalStatements<Then> = PixiVNJsonStepSwitch<Then> | PixiVNJsonIfElse<Then | PixiVNJsonConditionalStatements<Then> | PixiVNJsonConditionalResultToCombine<Then>>
export default PixiVNJsonConditionalStatements
