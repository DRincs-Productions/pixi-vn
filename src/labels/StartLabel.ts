import { ChoiceMenuOption } from "../classes";
import { PIXIVN_VERSION } from "../constants";
import { newLabel } from "../decorators";
import { setChoiceMenuOptions, setDialogue } from "../functions";
import { GameStepManager, GameWindowManager } from "../managers";
import { baseCanvasElementTestLabel } from "./BaseCanvasElementTestLabel";
import { canvasEventsTestLabel } from "./CanvasEventsTestLabel";
import { customTickerCanvasElementTestLabel } from "./CustomTickerCanvasElementTestLabel";
import { imagesAnimationsTest } from "./ImagesAnimationsTestLabel";
import { markdownTest } from "./MarkdownTest";
import { stepLabelTestLAbel } from "./StepLabelTest";
import { juliette } from "./TestConstant";
import { videoTest } from "./VideoTestLabel";

export const pixivnTestStartLabel = newLabel("___pixi_vn_example_start_label___",
    [
        () => {
            let currentTimeName = ""
            const hour = new Date().getHours()
            if (hour >= 5 && hour < 12) {
                currentTimeName = "morning🔅"
            } else if (hour >= 12 && hour < 18) {
                currentTimeName = "afternoon🔆"
            } else if (hour >= 18 && hour < 22) {
                currentTimeName = "evening⛅"
            } else {
                currentTimeName = "night🌙"
            }
            setDialogue({ character: juliette, text: `Good ${currentTimeName}! I'm ${juliette.name}, your virtual assistant. I'm here to help you with your tests.` })
        },
        () => setDialogue({ character: juliette, text: `You are running the Pixi’VN v${PIXIVN_VERSION} test. This test will guide you through the different features of the library.` }),
        (props) => GameStepManager.jumpLabel(pixivnTestStartLabel2, props),
    ]
)

const openLink = newLabel<{
    link: string
}>("___pixi_vn_open_link___",
    [
        (props) => {
            window.open(props.link)
            GameStepManager.goNext(props)
        },
    ]
)


const RESTART_TEST_LABEL = "___pixi_vn_restart_test_label___"
export const pixivnTestStartLabel2 = newLabel(RESTART_TEST_LABEL,
    [
        () => {
            GameWindowManager.clear()
            setDialogue({ character: juliette, text: "Which test would you like to start with?" })
            setChoiceMenuOptions([
                new ChoiceMenuOption("Open Pixi’VN Wiki", openLink, { link: "https://pixi-vn.web.app/" }),
                new ChoiceMenuOption("Images, Transitions and Animations Test", imagesAnimationsTest, {}),
                new ChoiceMenuOption("Video Test", videoTest, {}),
                new ChoiceMenuOption("Canvas Events Test", canvasEventsTestLabel, {}),
                new ChoiceMenuOption("Base Canvas Element Test", baseCanvasElementTestLabel, {}),
                new ChoiceMenuOption("Custom Ticker Canvas Element Test", customTickerCanvasElementTestLabel, {}),
                new ChoiceMenuOption("Steps and Labels Test", stepLabelTestLAbel, {}),
                new ChoiceMenuOption("Markdown Test", markdownTest, {}),
                new ChoiceMenuOption("Open Pixi’VN Github Issues", openLink, { link: "https://github.com/DRincs-Productions/pixi-vn/issues" }),
            ])
        },
        (props) => GameStepManager.jumpLabel(RESTART_TEST_LABEL, props),
    ]
)
