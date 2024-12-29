import { ChoiceMenuOption } from "../classes";
import { PIXIVN_VERSION } from "../constants";
import { getCharacterById, newLabel } from "../decorators";
import { canvas, narration } from "../managers";
import { imagesAnimationsTest } from "./ImagesAnimationsTestLabel";
import { inputTestLabel } from "./InputTestLabel";
import { markdownTest } from "./MarkdownTest";
import { soundTestLabel } from "./SoundTestLabel";
import { stepLabelTestLAbel } from "./StepLabelTest";
import { BASE_CANVAS_ELEMENT_LABEL, CANVAS_EVENTS_TEST_LABEL, CUSTOM_TICKER_CANVAS_ELEMENT_TEST_LABEL, juliette } from "./TestConstant";
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
            let julietteObj = getCharacterById(juliette)!
            narration.dialogue = { character: juliette, text: `Good ${currentTimeName}! I'm ${julietteObj.name}, your virtual assistant. I'm here to help you with your tests.` }
        },
        () => narration.dialogue = { character: juliette, text: `You are running the Pixi’VN v${PIXIVN_VERSION} test. This test will guide you through the different features of the library.` },
        (props) => narration.jumpLabel(pixivnTestStartLabel2, props),
    ]
)

const openLink = newLabel<{
    link: string
}>("___pixi_vn_open_link___",
    [
        async (props) => {
            window.open(props.link)
            await narration.goNext(props)
        },
    ]
)


const RESTART_TEST_LABEL = "___pixi_vn_restart_test_label___"
export const pixivnTestStartLabel2 = newLabel(RESTART_TEST_LABEL,
    [
        () => {
            canvas.clear()
            narration.dialogue = { character: juliette, text: "Which test would you like to start with?" }
            narration.choiceMenuOptions = [
                new ChoiceMenuOption("Open Pixi’VN Wiki", openLink, { link: "https://pixi-vn.web.app/" }),
                new ChoiceMenuOption("Open Pixi’VN Discord", openLink, { link: "https://discord.gg/E95FZWakzp" }),
                new ChoiceMenuOption("Open Pixi’VN Github Issues", openLink, { link: "https://github.com/DRincs-Productions/pixi-vn/issues" }),
                new ChoiceMenuOption("Images, Transitions and Animations Test", imagesAnimationsTest, {}),
                new ChoiceMenuOption("Video Test", videoTest, {}),
                new ChoiceMenuOption("Canvas Events Test", CANVAS_EVENTS_TEST_LABEL, {}),
                new ChoiceMenuOption("Sound Test", soundTestLabel, {}),
                new ChoiceMenuOption("Base Canvas Element Test", BASE_CANVAS_ELEMENT_LABEL, {}),
                new ChoiceMenuOption("Custom Ticker Canvas Element Test", CUSTOM_TICKER_CANVAS_ELEMENT_TEST_LABEL, {}),
                new ChoiceMenuOption("Steps and Labels Test", stepLabelTestLAbel, {}),
                new ChoiceMenuOption("Markdown Test", markdownTest, {}),
                new ChoiceMenuOption("Input Test", inputTestLabel, {}),
            ]
        },
        (props) => narration.jumpLabel(RESTART_TEST_LABEL, props),
    ]
)
