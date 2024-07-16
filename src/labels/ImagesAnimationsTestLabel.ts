import { ChoiceMenuOption, ChoiceMenuOptionClose } from "../classes"
import { CanvasImage } from "../classes/canvas"
import { FadeAlphaTicker, MoveTicker, RotateTicker, ZoomTicker } from "../classes/ticker"
import { Pause, Repeat } from "../constants"
import { newLabel } from "../decorators"
import { addImage, loadImage, removeWithDissolveTransition, removeWithFadeTransition, setChoiceMenuOptions, setDialogue, showWithDissolveTransition, showWithFadeTransition } from "../functions"
import { moveIn, moveOut, zoomIn } from "../functions/ImageUtility"
import { GameStepManager, GameWindowManager } from "../managers"
import { eggHeadImage, eggHeadName, flowerTopImage, flowerTopName, helmlokImage, helmlokName, juliette, skullyImage, skullyName } from "./TestConstant"

const IMAGE_ANIMAIONS_TEST_LABEL = "___pixi_vn_images_animations_test___"
export const imagesAnimationsTest = newLabel(IMAGE_ANIMAIONS_TEST_LABEL, [
    async () => {
        setDialogue({ character: juliette, text: `These are my 4 puppets: ${eggHeadName}, ${flowerTopName}, ${helmlokName} and ${skullyName}. They can appear, disappear and animate at my will.` })
        let eggHead = addImage("eggHead", eggHeadImage)
        await eggHead.load()
        eggHead.x = 100
        eggHead.y = 100
        let flowerTop = addImage("flowerTop", flowerTopImage)
        flowerTop.x = 300
        flowerTop.y = 100
        flowerTop.load()
        let helmlok = addImage("helmlok", helmlokImage)
        helmlok.x = 100
        helmlok.y = 300
        let skully = addImage("skully", skullyImage)
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
            new ChoiceMenuOption("Zoom", imagesZoomTest),
            new ChoiceMenuOption("Move in/out", imagesMoveInOutTest),
            new ChoiceMenuOption("Zoom in/out", imagesZoomInOutTest),
            new ChoiceMenuOptionClose("Cancel", true),
        ])
    },
    (props) => GameStepManager.jumpLabel(IMAGE_ANIMAIONS_TEST_LABEL, props),
])

const imagesDissolveTest = newLabel("___pixi_vn_images_dissolve_test___", [
    () => {
        setDialogue({
            character: juliette, text: `Here's what's going to happen:
- ${eggHeadName} will disappear with a dissolve effect. If you go next, ${eggHeadName} reappears with a dissolve effect without stopping the dissolve effect
- ${eggHeadName} will appear instead of ${flowerTopName}.
- ${helmlokName} will disappear with a fade effect and reappear with a fade effect, and repeat.
- ${skullyName} will disappear with a fade effect, wait for 0.5 seconds, and reappear with a fade effect.`
        })
        removeWithDissolveTransition(["eggHead"], { duration: 2 })
        let eggHead = new CanvasImage({ x: 300, y: 100 }, eggHeadImage)
        showWithDissolveTransition('flowerTop', eggHead, { duration: 1 })
        GameWindowManager.addTickersSteps("helmlok",
            [
                new FadeAlphaTicker({
                    duration: 1,
                    type: "hide",
                }, 1),
                new FadeAlphaTicker({
                    duration: 1,
                    type: "show"
                }, 1),
                Repeat,
            ]
        )
        GameWindowManager.addTickersSteps("skully",
            [
                new FadeAlphaTicker({
                    duration: 0.5,
                    type: "hide",
                    limit: 0.3,
                }, 1),
                Pause(0.5),
                new FadeAlphaTicker({
                    duration: 1,
                    type: "show",
                }, 1),
            ]
        )
    },
    async () => {
        showWithDissolveTransition('eggHead', eggHeadImage, { duration: 0.5 })
    }
])

const imagesFadeTest = newLabel("___pixi_vn_images_fade_test___", [
    () => {
        setDialogue({
            character: juliette, text: `Here's what's going to happen:
- ${eggHeadName} will disappear with a dissolve effect. If you go next, ${eggHeadName} reappears with a dissolve effect with stopping the dissolve effect
- ${eggHeadName} will appear instead of ${flowerTopName}.
- ${helmlokName} will disappear with a fade effect and reappear with a fade effect, and repeat.
- ${skullyName} will disappear with a fade effect, wait for 0.5 seconds, and reappear with a fade effect.`
        })
        removeWithFadeTransition(["eggHead"], { duration: 2 })
        let eggHead = new CanvasImage({ x: 300, y: 100 }, eggHeadImage)
        showWithFadeTransition('flowerTop', eggHead, { duration: 1 })
        GameWindowManager.addTickersSteps("helmlok",
            [
                new FadeAlphaTicker({
                    duration: 1,
                    type: "hide",
                }),
                new FadeAlphaTicker({
                    duration: 1,
                    type: "show"
                }),
                Repeat,
            ]
        )
        GameWindowManager.addTickersSteps("skully",
            [
                new FadeAlphaTicker({
                    duration: 0.5,
                    type: "hide",
                    limit: 0.3,
                }),
                Pause(0.5),
                new FadeAlphaTicker({
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
        showWithFadeTransition('eggHead', eggHeadImage, { duration: 0.5 })
    }
])

const imagesRotateTest = newLabel("___pixi_vn_images_rotate_test___", [
    () => {
        setDialogue({
            character: juliette, text: `Here's what's going to happen:
- ${eggHeadName} will rotate with a anchor set to 0.
- ${flowerTopName} will rotate with a anchor set to 0.5 and a exponential speed progression.
- ${helmlokName} will rotate with a anchor set to 0.5, rotate 2 times, move to the right, rotate 5 times, and repeat.
- ${skullyName} will rotate with a anchor set to 1, rotate 3 times, wait for 0.5 seconds, rotate 7 times.`
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
        GameWindowManager.addTicker("eggHead", new RotateTicker({
            speed: 6,
            clockwise: true,
        }))
        GameWindowManager.addTicker("flowerTop", new RotateTicker({
            speed: 6,
            clockwise: false,
            speedProgression: { type: "exponential", percentage: 0.01, limit: 300 }
        }))
        GameWindowManager.addTickersSteps("helmlok", [
            new RotateTicker({
                speed: 6,
                clockwise: true,
            }, 2),
            new RotateTicker({
                speed: 100,
                clockwise: false,
                speedProgression: { type: "exponential", percentage: -0.05 }
            }),
            Repeat,
        ])
        GameWindowManager.addTickersSteps("skully", [
            new RotateTicker({
                speed: 6,
                clockwise: true,
            }, 3),
            Pause(0.5),
            new RotateTicker({
                speed: 6,
                clockwise: false,
            }, 7),
        ])
    }
])

const imagesMoveTest = newLabel("___pixi_vn_images_move_test___", [
    () => {
        setDialogue({
            character: juliette, text: `Here's what's going to happen:
- ${eggHeadName} will move to { x: 500, y: 100 } with a speed of 0.4.
- ${flowerTopName} will move to { x: 500, y: 300 } with a speed of 0.3.
- ${helmlokName} will move to the right with a speed of 20 and a linear speed progression of -0.2, and then move to the left with a speed of 0.1 and a linear speed progression of 0.05.
- ${skullyName} will move to { x: 500, y: 500 } with a speed of 0.5, wait for 0.5 seconds, and move to { x: 100, y: 100 } with a speed of 0.5.`
        })
        GameWindowManager.addTicker("eggHead", new MoveTicker({
            destination: { x: 500, y: 100 },
            speed: 24,
        }))
        GameWindowManager.addTicker("flowerTop", new MoveTicker({
            destination: { x: 500, y: 300 },
            speed: 18,
        }))
        GameWindowManager.addTickersSteps("helmlok", [
            new MoveTicker({
                destination: { x: 100, y: 500 },
                speed: 1200,
                speedProgression: { type: "linear", amt: -12, limit: 60 }
            }),
            new MoveTicker({
                destination: { x: 1700, y: 500 },
                speed: 6,
                speedProgression: { type: "linear", amt: 3 }
            }),
            Repeat,
        ])
        GameWindowManager.addTickersSteps("skully", [
            new MoveTicker({
                destination: { x: 500, y: 500 },
                speed: 60,
            }),
            Pause(0.5),
            new MoveTicker({
                destination: { x: 100, y: 100 },
                speed: 60,
            }),
        ])
    }
])

const imagesZoomTest = newLabel("___pixi_vn_images_zoom_test___", [
    () => {
        setDialogue({
            character: juliette, text: `Here's what's going to happen:
- ${eggHeadName} will zoom out with a speed of 3 and a limit of -0.5.
- ${flowerTopName} will zoom in with a speed of 3 and a limit of 2.
- ${helmlokName} will unzoom with a speed of 3 and a limit of -1, and zoom in with a speed of 3 and a limit of 1, and repeat.
- ${skullyName} will zoom in with a speed of 0.1 and a limit of 5, wait for 0.5 seconds, and zoom out with a speed of 3 and a limit of 1.`
        })
        let eggHead = GameWindowManager.getCanvasElement<CanvasImage>("eggHead")
        if (eggHead)
            eggHead.scale.set(2)
        let helmlok = GameWindowManager.getCanvasElement<CanvasImage>("helmlok")
        if (helmlok)
            helmlok.anchor.set(0.5);
        GameWindowManager.addTicker("eggHead", new ZoomTicker({
            speed: 3,
            limit: -0.5,
            type: "unzoom"
        }))
        GameWindowManager.addTicker("flowerTop", new ZoomTicker({
            speed: 3,
            limit: 2,
        }))
        GameWindowManager.addTickersSteps("helmlok", [
            new ZoomTicker({
                speed: 3,
                limit: -1,
                type: "unzoom"
            }),
            new ZoomTicker({
                speed: 3,
                limit: 1,
            }),
            Repeat,
        ])
        GameWindowManager.addTickersSteps("skully", [
            new ZoomTicker({
                speed: 0.1,
                limit: 5,
                speedProgression: { type: "exponential", percentage: 0.02 }
            }),
            Pause(0.5),
            new ZoomTicker({
                "type": "unzoom",
                speed: 3,
                limit: 1,
            }),
        ])
    }
])

const imagesMoveInOutTest = newLabel("___pixi_vn_images_move_in_out_test___", [
    async () => {
        setDialogue({
            character: juliette, text: `Here's what's going to happen:
- ${eggHeadName} will move in from the top with a speed of 800. If you go next, ${eggHeadName} will move out from the bottom with a speed of 800.
- ${flowerTopName} will move in from the right with a speed of 800 and a speed progression of 0.02. If you go next, ${flowerTopName} will move out from the left with a speed of 800 and a speed progression of 0.02.
- ${helmlokName} will move in from the left with a speed of 800. If you go next, ${helmlokName} will move out from the right with a speed of 800.
- ${skullyName} will move in from the bottom with a speed of 800 and a speed progression of 0.02. If you go next, ${skullyName} will move out from the top with a speed of 800 and a speed progression of 0.02.`
        })
        let eggHead = new CanvasImage({ x: 100, y: 100 }, eggHeadImage)
        let flowerTop = new CanvasImage({ x: 300, y: 100 }, flowerTopImage)
        let helmlok = new CanvasImage({ x: 100, y: 300 }, helmlokImage)
        let skully = new CanvasImage({ x: 300, y: 300 }, skullyImage)
        moveIn("eggHead", eggHead, { speed: 800, direction: "down" })
        moveIn("flowerTop", flowerTop, {
            speed: 800, direction: "left",
            speedProgression: { type: "exponential", percentage: 0.02 }
        })
        moveIn("helmlok", helmlok, { speed: 800, direction: "right" })
        moveIn("skully", skully, {
            speed: 800, direction: "up",
            speedProgression: { type: "exponential", percentage: 0.02 }
        })
    },
    () => {
        moveOut("eggHead", { speed: 800, direction: "down" })
        moveOut("flowerTop", { speed: 800, direction: "left" })
        moveOut("helmlok", { speed: 800, direction: "right" })
        moveOut("skully", { speed: 800, direction: "up" })
    }
])

const imagesZoomInOutTest = newLabel("___pixi_vn_images_zoom_in_out_test___", [
    async () => {
        let eggHead = new CanvasImage({ x: 100, y: 100 }, eggHeadImage)
        let flowerTop = new CanvasImage({ x: 300, y: 100 }, flowerTopImage)
        let helmlok = new CanvasImage({ x: 100, y: 300 }, helmlokImage)
        let skully = new CanvasImage({ x: 300, y: 300 }, skullyImage)
        zoomIn("eggHead", eggHead, { speed: 3, direction: "down" })
        zoomIn("flowerTop", flowerTop, {
            speed: 3, direction: "left",
            speedProgression: { type: "exponential", percentage: 0.02 }
        })
        zoomIn("helmlok", helmlok, { speed: 3, direction: "right" })
        zoomIn("skully", skully, {
            speed: 3, direction: "up",
            speedProgression: { type: "exponential", percentage: 0.02 }
        })
    }
])
