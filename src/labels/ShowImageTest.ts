import { ChoiceMenuOption } from "../classes"
import { CanvasImage } from "../classes/canvas"
import { TickerFadeAlpha, TickerMove, TickerRotate } from "../classes/ticker"
import { Pause, Repeat } from "../constants"
import { newLabel } from "../decorators"
import { addImage, loadImage, removeWithDissolveTransition, removeWithFadeTransition, setChoiceMenuOptions, setDialogue, showWithDissolveTransition, showWithFadeTransition } from "../functions"
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
            new ChoiceMenuOption("Fade effect", imagesFadeTest),
            new ChoiceMenuOption("Rotate", imagesRotateTest),
            new ChoiceMenuOption("Move", imagesMoveTest),
        ])
    },
    (props) => GameStepManager.jumpLabel(IMAGE_ANIMAIONS_TEST_LABEL, props),
])

const imagesDissolveTest = newLabel("___pixi_vn_images_dissolve_test___", [
    () => {
        setDialogue({
            character: juliette, text: "Here's what's going to happen:" +
                " - Egg Head will disappear with a dissolve effect. If you go next, Egg Head reappears with a dissolve effect without stopping the dissolve effect" +
                " - Egg Head will appear instead of Flower Top." +
                " - Helmlok will disappear with a fade effect and reappear with a fade effect, and repeat." +
                " - Skully will disappear with a fade effect, wait for 0.5 seconds, and reappear with a fade effect."
        })
        removeWithDissolveTransition(["eggHead"], { duration: 2 })
        let eggHead = new CanvasImage({ x: 300, y: 100 }, "https://pixijs.com/assets/eggHead.png")
        showWithDissolveTransition('flowerTop', eggHead, { duration: 1 })
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
    }
])

const imagesFadeTest = newLabel("___pixi_vn_images_fade_test___", [
    () => {
        setDialogue({
            character: juliette, text: "Here's what's going to happen:" +
                " - Egg Head will disappear with a dissolve effect. If you go next, Egg Head reappears with a dissolve effect with stopping the dissolve effect" +
                " - Egg Head will appear instead of Flower Top." +
                " - Helmlok will disappear with a fade effect and reappear with a fade effect, and repeat." +
                " - Skully will disappear with a fade effect, wait for 0.5 seconds, and reappear with a fade effect."
        })
        removeWithFadeTransition(["eggHead"], { duration: 2 })
        let eggHead = new CanvasImage({ x: 300, y: 100 }, "https://pixijs.com/assets/eggHead.png")
        showWithFadeTransition('flowerTop', eggHead, { duration: 1 })
        GameWindowManager.addTickersSteps("helmlok",
            [
                new TickerFadeAlpha({
                    duration: 1,
                    type: "hide",
                }),
                new TickerFadeAlpha({
                    duration: 1,
                    type: "show"
                }),
                Repeat,
            ]
        )
        GameWindowManager.addTickersSteps("skully",
            [
                new TickerFadeAlpha({
                    duration: 0.5,
                    type: "hide",
                    limit: 0.3,
                }),
                Pause(0.5),
                new TickerFadeAlpha({
                    duration: 1,
                    type: "show",
                }),
            ]
        )
    },
    async () => {
        let eggHeadOld = GameWindowManager.getCanvasElement<CanvasImage>("eggHead")
        if (eggHeadOld)
            eggHeadOld.alpha = 0
        showWithFadeTransition('eggHead', "https://pixijs.com/assets/eggHead.png", { duration: 0.5 })
    }
])

const imagesRotateTest = newLabel("___pixi_vn_images_rotate_test___", [
    () => {
        setDialogue({
            character: juliette, text: "Here's what's going to happen:" +
                " - Egg Head will rotate with a anchor set to 0." +
                " - Flower Top will rotate with a anchor set to 0.5 and a exponential speed progression." +
                " - Helmlok will rotate with a anchor set to 0.5, rotate 2 times, move to the right, rotate 5 times, and repeat." +
                " - Skully will rotate with a anchor set to 1, rotate 3 times, wait for 0.5 seconds, rotate 7 times."
        })
        let eggHead = GameWindowManager.getCanvasElement<CanvasImage>("eggHead")
        if (eggHead)
            eggHead.anchor.set(0);
        let flowerTop = GameWindowManager.getCanvasElement<CanvasImage>("flowerTop")
        if (flowerTop)
            flowerTop.anchor.set(0.5);
        let helmlok = GameWindowManager.getCanvasElement<CanvasImage>("helmlok")
        if (helmlok)
            helmlok.anchor.set(0.5);
        let skully = GameWindowManager.getCanvasElement<CanvasImage>("skully")
        if (skully)
            skully.anchor.set(1);
        GameWindowManager.addTicker("eggHead", new TickerRotate({
            speed: 0.1,
            clockwise: true,
        }))
        GameWindowManager.addTicker("flowerTop", new TickerRotate({
            speed: 0.1,
            clockwise: false,
            speedProgression: { type: "exponential", percentage: 0.01, limit: 7 }
        }))
        GameWindowManager.addTickersSteps("helmlok", [
            new TickerRotate({
                speed: 0.1,
                clockwise: true,
            }, 2),
            new TickerRotate({
                speed: 5,
                clockwise: false,
                speedProgression: { type: "exponential", percentage: -0.05 }
            }),
            Repeat,
        ])
        GameWindowManager.addTickersSteps("skully", [
            new TickerRotate({
                speed: 0.1,
                clockwise: true,
            }, 3),
            Pause(0.5),
            new TickerRotate({
                speed: 0.1,
                clockwise: false,
            }, 7),
        ])
    }
])

const imagesMoveTest = newLabel("___pixi_vn_images_move_test___", [
    () => {
        setDialogue({
            character: juliette, text: "Here's what's going to happen:" +
                " - Egg Head will move to { x: 500, y: 100 } with a speed of 0.4." +
                " - Flower Top will move to { x: 500, y: 300 } with a speed of 0.3." +
                " - Helmlok will move to the right with a speed of 20 and a linear speed progression of -0.2, and then move to the left with a speed of 0.1 and a linear speed progression of 0.05." +
                " - Skully will move to { x: 500, y: 500 } with a speed of 0.5, wait for 0.5 seconds, and move to { x: 100, y: 100 } with a speed of 0.5."
        })
        GameWindowManager.addTicker("eggHead", new TickerMove({
            destination: { x: 500, y: 100 },
            speed: 0.4,
        }))
        GameWindowManager.addTicker("flowerTop", new TickerMove({
            destination: { x: 500, y: 300 },
            speed: 0.3,
        }))
        GameWindowManager.addTickersSteps("helmlok", [
            new TickerMove({
                destination: { x: 100, y: 500 },
                speed: 20,
                speedProgression: { type: "linear", amt: -0.2, limit: 1 }
            }),
            new TickerMove({
                destination: { x: 1700, y: 500 },
                speed: 0.1,
                speedProgression: { type: "linear", amt: 0.05 }
            }),
            Repeat,
        ])
        GameWindowManager.addTickersSteps("skully", [
            new TickerMove({
                destination: { x: 500, y: 500 },
                speed: 0.5,
            }),
            Pause(0.5),
            new TickerMove({
                destination: { x: 100, y: 100 },
                speed: 0.5,
            }),
        ])
    }
])
