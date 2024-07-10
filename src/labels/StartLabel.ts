import { ChoiceMenuOption, GameStepManager, GameWindowManager, newLabel, setChoiceMenuOptions, setDialogue } from "../pixi-vn/src";
import { juliette } from "../values/characters";
import { imagesAnimationsTest } from "./ShowImageTest";

export const pixivnTestStartLabel = newLabel("___pixi_vn_example_start_label___",
    [
        () => {
            let currentTimeName = ""
            const hour = new Date().getHours()
            if (hour >= 5 && hour < 12) {
                currentTimeName = "morning"
            } else if (hour >= 12 && hour < 18) {
                currentTimeName = "afternoon"
            } else if (hour >= 18 && hour < 22) {
                currentTimeName = "evening"
            } else {
                currentTimeName = "night"
            }
            setDialogue({ character: juliette, text: `Good ${currentTimeName}! I'm ${juliette.name}, your virtual assistant. I'm here to help you with your tests.` })
        },
        () => setDialogue({ character: juliette, text: `You are running the Pixi’VN test. This test will guide you through the different features of the library.` }),
        (props) => GameStepManager.jumpLabel(pixivnTestStartLabel2, props),
    ]
)

const RESTART_TEST_LABEL = "___pixi_vn_restart_test_label___"
export const pixivnTestStartLabel2 = newLabel(RESTART_TEST_LABEL,
    [
        () => {
            GameWindowManager.clear()
            setDialogue({ character: juliette, text: "Which test would you like to start with?" })
            setChoiceMenuOptions([
                new ChoiceMenuOption("Images and Animations", imagesAnimationsTest),
            ])
        },
        (props) => GameStepManager.jumpLabel(RESTART_TEST_LABEL, props),
    ]
)
