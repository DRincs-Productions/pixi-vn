import PixiVNJsonIfElse from "./PixiVNJsonIfElse"
import PixiVNJsonStepSwitch from "./PixiVNJsonStepSwitch"

type PixiVNJsonConditionalStatements<Then> = PixiVNJsonStepSwitch<Then> | PixiVNJsonIfElse<Then | PixiVNJsonStepSwitch<Then>>
export default PixiVNJsonConditionalStatements
