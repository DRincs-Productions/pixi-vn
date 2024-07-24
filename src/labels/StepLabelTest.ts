import { newLabel } from "../decorators"
import { setDialogue } from "../functions"
import { juliette } from "./TestConstant"

const STEP_LABEL_TEST_LABEL = "___pixi_vn_step_label_test___"
export const stepLabelTestLAbel = newLabel(STEP_LABEL_TEST_LABEL, [
    async () => {
        setDialogue({ character: juliette, text: "Pixi'VN manages the succession of \"screens\" with steps. Each step is a function that can be asynchronous." })
    },
    async () => {
        setDialogue({ character: juliette, text: "The labels are containers of steps, they are used to organize the steps in a more readable way. For start a steps sequence, you must call or jump to a label." })
    },
    async () => {
        setDialogue({ character: juliette, text: "It is also possible to ask the player to make a choice." })
    },
    async () => {
        setDialogue({ character: juliette, text: "Browsing through available tests is one way to test the steps/labels system." })
    },
])
