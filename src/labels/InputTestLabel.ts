import { newLabel } from "../decorators";
import { narration } from "../managers";
import { INPUT_TEST_LABEL, juliette } from "./TestConstant";

export const inputTestLabel = newLabel(INPUT_TEST_LABEL,
    [
        () => {
            narration.dialogue = {
                character: juliette,
                text: "What is your name?"
            }
            narration.requestInput({ type: "string" }, "default value")
        },
        () => {
            narration.dialogue = {
                character: juliette,
                text: `Nice to meet you, ${narration.inputValue}!`
            }
        }
    ]
)
