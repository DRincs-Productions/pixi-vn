import { ChoiceMenuOption } from "../classes"
import { CanvasImage } from "../classes/canvas"
import { TickerFadeAlpha } from "../classes/ticker"
import { Pause, Repeat } from "../constants"
import { newLabel } from "../decorators"
import { addImage, loadImage, removeWithDissolveTransition, setChoiceMenuOptions, setDialogue, showWithDissolveTransition } from "../functions"
import { GameStepManager, GameWindowManager } from "../managers"
import { juliette } from "./characters"

const IMAGE_ANIMAIONS_TEST_LABEL = "___pixi_vn_images_animations_test___"
export const imagesAnimationsTest = newLabel(IMAGE_ANIMAIONS_TEST_LABEL, [
    async () => {
        setDialogue({ character: juliette, text: "These are my 4 puppets: Egg Head, Flower Top, Helmlok and Skully. They can appear, disappear and animate at my will." })
        let eggHead = addImage("eggHead", "https://pixijs.com/assets/eggHead.png")
        await eggHead.load()
        eggHead.x = 100
        eggHead.y = 100
        let flowerTop = addImage("flowerTop", "https://pixijs.com/assets/flowerTop.png")
        flowerTop.x = 300
        flowerTop.y = 100
        flowerTop.load()
        let helmlok = addImage("helmlok", 'https://pixijs.com/assets/helmlok.png')
        helmlok.x = 100
        helmlok.y = 300
        let skully = addImage("skully", 'https://pixijs.com/assets/skully.png')
        skully.x = 300
        skully.y = 300
        await loadImage([helmlok, skully])
    },
    async () => {
        setDialogue({ character: juliette, text: "Here's what they can do." })
        setChoiceMenuOptions([
            new ChoiceMenuOption("Dissolve effect", imagesDissolveTest),
        ])
    },
    (props) => GameStepManager.jumpLabel(IMAGE_ANIMAIONS_TEST_LABEL, props),
])

const imagesDissolveTest = newLabel("___pixi_vn_images_dissolve_test___", [
    () => {
        setDialogue({
            character: juliette, text: "Here's what's going to happen:" +
                " - Egg Head and Flower Top will disappear with a dissolve effect. If you go next, Egg Head reappears with a dissolve effect without stopping the dissolve effect, and Flower Top will appear with a dissolve effect." +
                " - Helmlok will disappear with a fade effect and reappear with a fade effect, and repeat." +
                " - Skully will disappear with a fade effect, wait for 0.5 seconds, and reappear with a fade effect."
        })
        removeWithDissolveTransition(["eggHead", "flowerTop"], { duration: 2 })
        GameWindowManager.addTickersSteps("helmlok",
            [
                new TickerFadeAlpha({
                    duration: 1,
                    type: "hide",
                }, 1),
                new TickerFadeAlpha({
                    duration: 1,
                    type: "show"
                }, 1),
                Repeat,
            ]
        )
        GameWindowManager.addTickersSteps("skully",
            [
                new TickerFadeAlpha({
                    duration: 0.5,
                    type: "hide",
                    limit: 0.3,
                }, 1),
                Pause(0.5),
                new TickerFadeAlpha({
                    duration: 1,
                    type: "show",
                }, 1),
            ]
        )
    },
    async () => {
        showWithDissolveTransition('eggHead', "https://pixijs.com/assets/eggHead.png", { duration: 0.5 })
        let flowerTopOld = GameWindowManager.getCanvasElement<CanvasImage>("flowerTop")
        if (flowerTopOld)
            flowerTopOld.alpha = 0
        let flowerTop = new CanvasImage({ x: 300, y: 100 }, "https://pixijs.com/assets/flowerTop.png")
        showWithDissolveTransition('flowerTop', flowerTop, { duration: 1 })
    }
])