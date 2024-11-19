import { CanvasImage, ChoiceMenuOptionClose } from "../classes"
import { newLabel } from "../decorators"
import { showWithDissolveTransition } from "../functions"
import { canvas, narration } from "../managers"
import { helmlokImage, juliette } from "./TestConstant"

const IMAGE_ANIMAIONS_TEST_LABEL = "___pixi_vn_images_animations_test___"
export const imagesAnimationsTest = newLabel(IMAGE_ANIMAIONS_TEST_LABEL, [
    async () => {
        canvas.removeAll()
        let imageToShow = new CanvasImage(undefined, helmlokImage)
        await showWithDissolveTransition("eggHead", imageToShow, {}, undefined)
    },
    async () => {
        narration.dialogue = { character: juliette, text: "Here's what they can do." }
        narration.choiceMenuOptions = [
            new ChoiceMenuOptionClose("Cancel", { closeCurrentLabel: true }),
        ]
    },
    (props) => narration.jumpLabel(IMAGE_ANIMAIONS_TEST_LABEL, props),
])
