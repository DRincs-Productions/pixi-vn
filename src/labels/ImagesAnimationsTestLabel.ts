import { ChoiceMenuOption, ChoiceMenuOptionClose, ImageSprite, Label } from "../classes"
import ImageContainer from "../classes/canvas/ImageContainer"
import { FadeAlphaTicker, MoveTicker, RotateTicker, ZoomTicker } from "../classes/ticker"
import { CANVAS_APP_STAGE_ALIAS, Pause, Repeat } from "../constants"
import { addImage, moveIn, moveOut, removeWithDissolve, removeWithFade, shakeEffect, showImage, showWithDissolve, showWithFade, zoomIn, zoomOut } from "../functions"
import { pushIn, pushOut } from "../functions/canvas/canvas-transition"
import { addImageCointainer } from "../functions/canvas/image-container-utility"
import { canvas, narration } from "../managers"
import { eggHeadImage, eggHeadName, flowerTopImage, flowerTopName, helmlokImage, helmlokName, IMAGE_ANIMAIONS_TEST_LABEL, IMAGE_CONTAINER_TEST_LABEL, IMAGE_DISSOLVE_TEST_LABEL, IMAGE_FADE_TEST_LABEL, IMAGE_MOVE_IN_OUT_TEST_LABEL, IMAGE_MOVE_TEST_LABEL, IMAGE_PUSH_IN_OUT_TEST_LABEL, IMAGE_ROTATE_TEST_LABEL, IMAGE_ZOOM_IN_OUT_TEST_LABEL, IMAGE_ZOOM_TEST_LABEL, IMAGES_ADD_SAME_TAG_TEST_LABEL, IMAGES_CUSTOM_POSITION_TEST_LABEL, IMAGES_SHAKE_STAGE_TEST_LABEL, juliette, skullyImage, skullyName } from "./TestConstant"

export const imagesAnimationsTest = new Label(IMAGE_ANIMAIONS_TEST_LABEL, [
    async () => {
        canvas.removeAll()
        narration.dialogue = { character: juliette, text: `These are my 4 puppets: ${eggHeadName}, ${flowerTopName}, ${helmlokName} and ${skullyName}. They can appear, disappear and animate at my will.` }
        let eggHead = addImage("eggHead", eggHeadImage)
        await eggHead.load()
        eggHead.x = 100
        eggHead.y = 100
        let flowerTop = addImage("flowerTop", flowerTopImage)
        flowerTop.x = 300
        flowerTop.y = 100
        flowerTop.load()
        showImage("helmlok", helmlokImage, { x: 100, y: 300 })
        showImage("skully", skullyImage, { x: 300, y: 300 })
    },
    async () => {
        narration.dialogue = { character: juliette, text: "Here's what they can do." }
        narration.choiceMenuOptions = [
            new ChoiceMenuOption("Dissolve effect", imagesDissolveTest, {}),
            new ChoiceMenuOption("Fade effect", imagesFadeTest, {}),
            new ChoiceMenuOption("Rotate", imagesRotateTest, {}),
            new ChoiceMenuOption("Move", imagesMoveTest, {}),
            new ChoiceMenuOption("Zoom", imagesZoomTest, {}),
            new ChoiceMenuOption("Move in/out", imagesMoveInOutTest, {}),
            new ChoiceMenuOption("Zoom in/out", imagesZoomInOutTest, {}),
            new ChoiceMenuOption("Push in/out", imagesPushInOutTest, {}),
            new ChoiceMenuOption("Shake", shakeStageTest, {}),
            new ChoiceMenuOption("Add same alias", imagesAddSameAliasTestLabel, {}),
            new ChoiceMenuOption("Image container", imageContainerTest, {}),
            new ChoiceMenuOption("Additional Positions", customPositionTest, {}),
            new ChoiceMenuOptionClose("Cancel", { closeCurrentLabel: true }),
        ]
    },
    (props, { labelId }) => narration.jumpLabel(labelId, props),
])

export const imagesDissolveTest = new Label(IMAGE_DISSOLVE_TEST_LABEL, [
    () => {
        narration.dialogue = {
            character: juliette, text: `Here's what's going to happen:
- ${eggHeadName} will disappear with a dissolve effect. If you go next, ${eggHeadName} reappears with a dissolve effect without stopping the dissolve effect
- ${eggHeadName} will appear instead of ${flowerTopName}.
- ${helmlokName} will disappear with a fade effect and reappear with a fade effect, and repeat.
- ${skullyName} will disappear with a fade effect, wait for 0.5 seconds, and reappear with a fade effect.`
        }
        removeWithDissolve(["eggHead"], { duration: 2 })
        let eggHead = new ImageSprite({ x: 300, y: 100 }, eggHeadImage)
        showWithDissolve('flowerTop', eggHead, { duration: 1 })
        canvas.addTickersSequence("helmlok",
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
        canvas.addTickersSequence("skully",
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
        showWithDissolve('eggHead', eggHeadImage, { duration: 0.5 })
    }
])

export const imagesFadeTest = new Label(IMAGE_FADE_TEST_LABEL, [
    () => {
        narration.dialogue = {
            character: juliette, text: `Here's what's going to happen:
- ${eggHeadName} will disappear with a dissolve effect. If you go next, ${eggHeadName} reappears with a dissolve effect with stopping the dissolve effect
- ${eggHeadName} will appear instead of ${flowerTopName}.
- ${helmlokName} will disappear with a fade effect and reappear with a fade effect, and repeat.
- ${skullyName} will disappear with a fade effect, wait for 0.5 seconds, and reappear with a fade effect.`
        }
        removeWithFade(["eggHead"], { duration: 2 })
        let eggHead = new ImageSprite({ x: 300, y: 100 }, eggHeadImage)
        showWithFade('flowerTop', eggHead, { duration: 1 })
        canvas.addTickersSequence("helmlok",
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
        canvas.addTickersSequence("skully",
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
        let eggHeadOld = canvas.find<ImageSprite>("eggHead")
        if (eggHeadOld)
            eggHeadOld.alpha = 0
        showWithFade('eggHead', eggHeadImage, { duration: 0.5 })
    }
])

export const imagesRotateTest = new Label(IMAGE_ROTATE_TEST_LABEL, [
    () => {
        narration.dialogue = {
            character: juliette, text: `Here's what's going to happen:
- ${eggHeadName} will rotate with a anchor set to 0.
- ${flowerTopName} will rotate with a anchor set to 0.5 and a exponential speed progression.
- ${helmlokName} will rotate with a anchor set to 0.5, rotate clockwise for 2 seconds, rotate counterclockwise with a exponential (-0.05) speed progression, and when it reaches 0, it will repeat.
- ${skullyName} will rotate with a anchor set to 1, rotate 3 seconds clockwise, wait for 0.5 seconds, and rotate 7 seconds counterclockwise.`
        }
        let eggHead = canvas.find<ImageSprite>("eggHead")
        if (eggHead)
            eggHead.anchor.set(0);
        let flowerTop = canvas.find<ImageSprite>("flowerTop")
        if (flowerTop)
            flowerTop.anchor.set(0.5);
        let helmlok = canvas.find<ImageSprite>("helmlok")
        if (helmlok)
            helmlok.anchor.set(0.5);
        let skully = canvas.find<ImageSprite>("skully")
        if (skully)
            skully.anchor.set(1);
        canvas.addTicker("eggHead", new RotateTicker({
            speed: 6,
            clockwise: true,
        }))
        canvas.addTicker("flowerTop", new RotateTicker({
            speed: 6,
            clockwise: false,
            speedProgression: { type: "exponential", percentage: 0.01, limit: 300 }
        }))
        canvas.addTickersSequence("helmlok", [
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
        canvas.addTickersSequence("skully", [
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

export const imagesMoveTest = new Label(IMAGE_MOVE_TEST_LABEL, [
    () => {
        narration.dialogue = {
            character: juliette, text: `Here's what's going to happen:
- ${eggHeadName} will move to { x: 500, y: 100 } with a speed of 24.
- ${flowerTopName} will move to { x: 0.5, y: 0.5, type: "align" } with a speed of 18.
- ${helmlokName} will move to { x: 100, y: 500 } with a speed of 150 and a linear speed progression of -2 ( limit 10 ), and then move to { x: 1700, y: 500 } with a speed of 10 and a linear speed progression of 2 ( limit 150 ), and repeat.
- ${skullyName} will move to { x: 500, y: 500 } with a speed of 40, wait for 0.5 seconds, and move to { x: 100, y: 100 } with a speed of 40.`
        }
        canvas.addTicker("eggHead", new MoveTicker({
            destination: { x: 500, y: 100 },
            speed: 24,
        }))
        canvas.addTicker("flowerTop", new MoveTicker({
            destination: { x: 0.5, y: 0.5, type: "align" },
            speed: 18,
        }))
        canvas.addTickersSequence("helmlok", [
            new MoveTicker({
                destination: { x: 100, y: 500 },
                speed: 150,
                speedProgression: { type: "linear", amt: -2, limit: 10 }
            }),
            new MoveTicker({
                destination: { x: 1700, y: 500 },
                speed: 10,
                speedProgression: { type: "linear", amt: 2, limit: 150 }
            }),
            Repeat,
        ])
        canvas.addTickersSequence("skully", [
            new MoveTicker({
                destination: { x: 500, y: 500 },
                speed: 40,
            }),
            Pause(0.5),
            new MoveTicker({
                destination: { x: 100, y: 100 },
                speed: 40,
            }),
        ])
    }
])

export const imagesZoomTest = new Label(IMAGE_ZOOM_TEST_LABEL, [
    () => {
        narration.dialogue = {
            character: juliette, text: `Here's what's going to happen:
- ${eggHeadName} will zoom out with a speed of 30 and a limit of -5.
- ${flowerTopName} will zoom in with a speed of 30 and a limit of 20.
- ${helmlokName} will unzoom with a speed of 30 and a limit of -10, and zoom in with a speed of 3 and a limit of 10, and repeat.
- ${skullyName} will zoom in with a speed of 1 and a limit of 50, wait for 0.5 seconds, and zoom out with a speed of 30 and a limit of 10.`
        }
        let eggHead = canvas.find<ImageSprite>("eggHead")
        if (eggHead)
            eggHead.scale.set(2)
        let helmlok = canvas.find<ImageSprite>("helmlok")
        if (helmlok)
            helmlok.anchor.set(0.5);
        canvas.addTicker("eggHead", new ZoomTicker({
            speed: 30,
            limit: -5,
            type: "unzoom"
        }))
        canvas.addTicker("flowerTop", new ZoomTicker({
            speed: 30,
            limit: 20,
        }))
        canvas.addTickersSequence("helmlok", [
            new ZoomTicker({
                speed: 30,
                limit: -10,
                type: "unzoom"
            }),
            new ZoomTicker({
                speed: 30,
                limit: 10,
            }),
            Repeat,
        ])
        canvas.addTickersSequence("skully", [
            new ZoomTicker({
                speed: 1,
                limit: 50,
                speedProgression: { type: "exponential", percentage: 0.02 }
            }),
            Pause(0.5),
            new ZoomTicker({
                "type": "unzoom",
                speed: 30,
                limit: 10,
            }),
        ])
    }
])

export const imagesMoveInOutTest = new Label(IMAGE_MOVE_IN_OUT_TEST_LABEL, [
    async () => {
        narration.dialogue = {
            character: juliette, text: `Here's what's going to happen:
- ${eggHeadName} will move in from the top with a speed of 80. If you go next, ${eggHeadName} will move out from the bottom with a speed of 80.
- ${flowerTopName} will move in from the right with a speed of 80 and a speed progression of 0.02. If you go next, ${flowerTopName} will move out from the left with a speed of 80 and a speed progression of 0.02.
- ${helmlokName} will move in from the left with a speed of 80. If you go next, ${helmlokName} will move out from the right with a speed of 80.
- ${skullyName} will move in from the bottom with a speed of 80 and a speed progression of 0.02. If you go next, ${skullyName} will move out from the top with a speed of 80 and a speed progression of 0.02.`
        }
        let eggHead = new ImageSprite({ x: 100, y: 100 }, eggHeadImage)
        let flowerTop = new ImageSprite({ x: 300, y: 100 }, flowerTopImage)
        let helmlok = new ImageSprite({ x: 100, y: 300 }, helmlokImage)
        let skully = new ImageSprite({ x: 300, y: 300 }, skullyImage)
        moveIn("eggHead", eggHead, { speed: 80, direction: "down" })
        moveIn("flowerTop", flowerTop, {
            speed: 80, direction: "left",
            speedProgression: { type: "exponential", percentage: 0.02 }
        })
        moveIn("helmlok", helmlok, { speed: 80, direction: "right" })
        moveIn("skully", skully, {
            speed: 80, direction: "up",
            speedProgression: { type: "exponential", percentage: 0.02 },
            removeOldComponentWithMoveOut: true
        })
    },
    () => {
        moveOut("eggHead", { speed: 80, direction: "down" })
        moveOut("flowerTop", { speed: 80, direction: "left" })
        moveOut("helmlok", { speed: 80, direction: "right" })
        moveOut("skully", { speed: 80, direction: "up" })
    }
])

export const imagesZoomInOutTest = new Label(IMAGE_ZOOM_IN_OUT_TEST_LABEL, [
    async () => {
        narration.dialogue = {
            character: juliette, text: `Here's what's going to happen:
- ${eggHeadName} will zoom in with a speed of 30. If you go next, ${eggHeadName} will zoom out with a speed of 30.
- ${flowerTopName} will zoom in with a speed of 30 and a speed progression of 0.02. If you go next, ${flowerTopName} will zoom out with a speed of 30.
- ${helmlokName} will zoom in with a speed of 30. If you go next, ${helmlokName} will zoom out with a speed of 10.
- ${skullyName} will zoom in with a speed of 30 and a speed progression of 0.02. If you go next, ${skullyName} will zoom out with a speed of 30 and a speed progression of 0.02.`
        }
        let eggHead = new ImageSprite({ x: 100, y: 100 }, eggHeadImage)
        let flowerTop = new ImageSprite({ x: 300, y: 100 }, flowerTopImage)
        let helmlok = new ImageSprite({ x: 100, y: 300 }, helmlokImage)
        let skully = new ImageSprite({ x: 300, y: 300 }, skullyImage)
        zoomIn("eggHead", eggHead, { speed: 30, direction: "down" })
        zoomIn("flowerTop", flowerTop, {
            speed: 30, direction: "left",
            speedProgression: { type: "exponential", percentage: 0.02 },
            removeOldComponentWithZoomOut: true
        })
        zoomIn("helmlok", helmlok, { speed: 30, direction: "right" })
        zoomIn("skully", skully, {
            speed: 30, direction: "up",
            speedProgression: { type: "exponential", percentage: 0.02 }
        })
    },
    async () => {
        zoomOut("eggHead", {
            speed: 30, direction: "down",
            speedProgression: { type: "exponential", percentage: 0.02 }
        })
        zoomOut("flowerTop", { speed: 30, direction: "left" })
        zoomOut("helmlok", { speed: 10, direction: "right" })
        zoomOut("skully", {
            speed: 30, direction: "up",
            speedProgression: { type: "exponential", percentage: 0.02 }
        })
    },
])

export const imagesPushInOutTest = new Label(IMAGE_PUSH_IN_OUT_TEST_LABEL, [
    async () => {
        narration.dialogue = {
            character: juliette, text: `Here's what's going to happen:`
        }
        let eggHead = new ImageSprite({ x: 100, y: 100 }, eggHeadImage)
        let flowerTop = new ImageSprite({ x: 300, y: 100 }, flowerTopImage)
        let helmlok = new ImageSprite({ x: 100, y: 300 }, helmlokImage)
        let skully = new ImageSprite({ x: 300, y: 300 }, skullyImage)
        pushIn("eggHead", eggHead, { speed: 20, direction: "down" })
        pushIn("flowerTop", flowerTop, {
            speed: 3, direction: "left",
            speedProgression: { type: "exponential", percentage: 0.02 }
        })
        pushIn("helmlok", helmlok, { speed: 30, direction: "right" })
        pushIn("skully", skully, {
            speed: 3, direction: "up",
            speedProgression: { type: "exponential", percentage: 0.02 }
        })
    },
    async () => {
        pushOut("eggHead", {
            speed: 3, direction: "down",
            speedProgression: { type: "exponential", percentage: 0.02 }
        })
        pushOut("flowerTop", { speed: 30, direction: "left" })
        pushOut("helmlok", { speed: 10, direction: "right" })
        pushOut("skully", {
            speed: 3, direction: "up",
            speedProgression: { type: "exponential", percentage: 0.02 }
        })
    },
])

export const imagesAddSameAliasTestLabel = new Label(IMAGES_ADD_SAME_TAG_TEST_LABEL, [
    () => {
        narration.dialogue = {
            character: juliette,
            text: `Now they will be added at each step with the same alias. Here's what's going to happen, All styles and tickers will be transferred to the new image.`,
        }
        canvas.remove("flowerTop")
        canvas.remove("helmlok")
        canvas.remove("skully")
        let skully = canvas.find<ImageSprite>("eggHead")
        if (skully) {
            skully.anchor.set(0.5)
            skully.alpha = 0.5
        }

        canvas.addTicker("eggHead", new RotateTicker({
            speed: 6,
        }))
        canvas.addTickersSequence("eggHead", [
            new MoveTicker({
                destination: { x: 100, y: 100 },
                speed: 200,
            }),
            new MoveTicker({
                destination: { x: 100, y: 500 },
                speed: 200,
            }),
            new MoveTicker({
                destination: { x: 1700, y: 500 },
                speed: 200,
            }),
            new MoveTicker({
                destination: { x: 1700, y: 100 },
                speed: 200,
            }),
            Repeat,
        ])
    },
    async () => await showImage("eggHead", flowerTopImage),
    async () => await showWithDissolve("eggHead", helmlokImage),
    async () => await showWithFade("eggHead", skullyImage),
    async () => await moveIn("eggHead", eggHeadImage, { speed: 100 }),
    async () => await zoomIn("eggHead", flowerTopImage),
    async () => await pushIn("eggHead", helmlokImage, { speed: 100 }),
])

export const shakeStageTest = new Label(IMAGES_SHAKE_STAGE_TEST_LABEL, [
    () => {
        narration.dialogue = {
            character: juliette,
            text: `Ok this is a test for the shake effect. The ${eggHeadName} will shake.`
        }
        shakeEffect("eggHead")
    },
    () => {
        narration.dialogue = {
            character: juliette,
            text: `Now the whole stage will shake.`
        }
        shakeEffect(CANVAS_APP_STAGE_ALIAS)
    },
])

export const imageContainerTest = new Label(IMAGE_CONTAINER_TEST_LABEL, [
    async () => {
        narration.dialogue = {
            character: juliette,
            text: `Now I will show you the image container.`
        }
        canvas.removeAll()
        let container = new ImageContainer(undefined, [eggHeadImage, flowerTopImage])
        container.x = 300
        container.y = 300
        showWithDissolve("container", container)
        container.anchor = 0.5
        canvas.addTicker("container", new RotateTicker({
            speed: 6,
        }))
    },
    async () => {
        let container = new ImageContainer(undefined, [helmlokImage, skullyImage])
        canvas.add("container", container)
        await container.load()
    },
])

export const customPositionTest = new Label(IMAGES_CUSTOM_POSITION_TEST_LABEL, [
    () => {
        narration.dialogue = {
            character: juliette,
            text: `Now I will show a test for the align.
- The container will be added with the anchor set to 0.5 and align set to 0.5.
- ${helmlokName} will be added with the anchor set to 1 and align set to 0.
- ${skullyName} will be added with the anchor set to 0.5 and align set to 0.25.`
        }
        canvas.removeAll()
        let container = new ImageContainer({ anchor: 0.5, align: 0.5 }, [eggHeadImage, flowerTopImage])
        canvas.add("container", container)
        let helmlok = addImage("helmlok", helmlokImage)
        helmlok.angle = 45
        helmlok.anchor = 0.5
        helmlok.xAlign = 1
        helmlok.yAlign = 0
        let skully = addImage("skully", skullyImage)
        skully.anchor = 0.5
        skully.xAlign = 0.25
        skully.yAlign = 0.5
        container.load()
        helmlok.load()
        skully.load()
    },
    () => {
        narration.dialogue = {
            character: juliette,
            text: `Now I will show a test for the percentagePosition.
- The container will be added with the anchor set to 0.5 and percentagePosition set to 0.5.
- ${helmlokName} will be added with the anchor set to 1 and percentagePosition set to 0.
- ${skullyName} will be added with the anchor set to 0.5 and percentagePosition set to 0.25.`
        }
        canvas.removeAll()
        let container = addImageCointainer("container", [eggHeadImage, flowerTopImage])
        container.anchor = 0.5
        container.percentagePosition = 0.5
        let helmlok = addImage("helmlok", helmlokImage)
        helmlok.anchor = 0.5
        helmlok.xPercentagePosition = 1
        helmlok.yPercentagePosition = 0
        let skully = addImage("skully", skullyImage)
        skully.anchor = 0.5
        skully.xPercentagePosition = 0.25
        skully.yPercentagePosition = 0.5
        container.load()
        helmlok.load()
        skully.load()
    },
])