import { newLabel } from "../decorators";
import { narration } from "../managers";
import { juliette } from "./TestConstant";

const INPUT_TEST_LABEL = "___pixi_vn_input_test___"

export const inputTestLabel = newLabel(INPUT_TEST_LABEL,
    [
        () => {
            narration.dialogue = {
                character: juliette,
                text: "What is your name?"
            }
            narration.requestInput({ type: "string" })
        },
        () => {
            narration.dialogue = {
                character: juliette,
                text: `Nice to meet you, ${narration.inputValue}!`
            }
        }
    ]
)
