import { newLabel } from "../decorators"
import { narration } from "../managers"
import { juliette } from "./TestConstant"

const STEP_LABEL_TEST_LABEL = "___pixi_vn_step_label_test___"
export const stepLabelTestLAbel = newLabel(STEP_LABEL_TEST_LABEL, [
    async () => {
        narration.dialogue = { character: juliette, text: "Pixi'VN manages the succession of \"screens\" with steps. Each step is a function that can be asynchronous." }
    },
    async () => {
        narration.dialogue = { character: juliette, text: "The labels are containers of steps, they are used to organize the steps in a more readable way. For start a steps sequence, you must call or jump to a label." }
    },
    async () => {
        narration.dialogue = { character: juliette, text: "It is also possible to ask the player to make a choice." }
    },
    async () => {
        narration.dialogue = { character: juliette, text: "Browsing through available tests is one way to test the steps/labels system." }
    },
])
