import PixiVNJsonConditions from "./PixiVNJsonConditions";

interface PixiVNJsonIfElse<Then> {
    condition: PixiVNJsonConditions,
    then: Then | PixiVNJsonIfElse<Then>,
    else: Then | PixiVNJsonIfElse<Then>,
}

export default PixiVNJsonIfElse
