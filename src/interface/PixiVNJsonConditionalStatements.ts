import PixiVNJsonIfElse from "./PixiVNJsonIfElse"
import PixiVNJsonLabelCondition from "./PixiVNJsonLabelCondition"
import PixiVNJsonStepSwitch from "./PixiVNJsonStepSwitch"

type PixiVNJsonConditionalStatements<Then> = PixiVNJsonStepSwitch<Then> | PixiVNJsonIfElse<Then | PixiVNJsonConditionalStatements<Then>> | PixiVNJsonLabelCondition<Then | PixiVNJsonConditionalStatements<Then>>
export default PixiVNJsonConditionalStatements
