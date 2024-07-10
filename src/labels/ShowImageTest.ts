import { addImage, CanvasImage, ChoiceMenuOption, GameStepManager, GameWindowManager, loadImage, newLabel, removeWithDissolveTransition, Repeat, setChoiceMenuOptions, setDialogue, showWithDissolveTransition, TickerFadeAlpha } from "../pixi-vn/src";
import { juliette } from "../values/characters";

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
    },
    async () => {
        showWithDissolveTransition('eggHead', "https://pixijs.com/assets/eggHead.png", { duration: 0.5 })
        let flowerTop = new CanvasImage({ x: 300, y: 100 }, "https://pixijs.com/assets/flowerTop.png")
        showWithDissolveTransition('flowerTop', flowerTop, { duration: 1 })
    }
])