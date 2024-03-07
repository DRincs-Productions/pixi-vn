import { Label } from "../lib/classes/Label";
import { TickerRotate } from "../lib/classes/ticker/TickerRotate";
import { labelDecorator } from "../lib/decorators/LabelDecorator";
import { setDialogue } from "../lib/functions/DialogueUtility";
import { addImage, removeImage, showCanvasImages, showImage, showImageWithDisolveEffect, showImageWithEffect } from "../lib/functions/ImageUtility";
import { StepLabelType } from "../lib/types/StepLabelType";

@labelDecorator()
export class ShowImageTest extends Label {
    override get steps(): StepLabelType[] {
        return [
            async () => {
                setDialogue("You can also add a image to the canvas with the function showImage. If use await the user not can continue until the image is loaded.")
                let bunny1 = await showImage("bunny1", "https://pixijs.com/assets/eggHead.png")
                bunny1.x = 100
                bunny1.y = 100
                showImage("bunny2", "https://pixijs.com/assets/flowerTop.png")
                    .then((bunny2) => {
                        console.log("bunny2 loaded")
                        bunny2.x = 300
                        bunny2.y = 100
                    })
            },
            () => {
                removeImage("bunny1")
                removeImage("bunny2")
                setDialogue("You can also remove a image from the canvas with the function removeImage.")
            },
            async () => {
                setDialogue("If you want to show more images at the same time, you can use the function showCanvasImages.")
                let alien1 = addImage("alien1", 'https://pixijs.com/assets/eggHead.png')
                alien1.x = 100
                alien1.y = 100
                let alien2 = addImage("alien2", 'https://pixijs.com/assets/flowerTop.png')
                alien2.x = 300
                alien2.y = 100
                await showCanvasImages([alien1, alien2])
            },
            async () => {
                let alien = await showImageWithEffect("alien", 'https://pixijs.com/assets/eggHead.png',
                    new TickerRotate({ speed: 0.1 }),
                )
                alien.anchor.set(0.5);
                alien.x = 100
                alien.y = 100
                setDialogue("You can also show a image with a effect with the function showImageWithEffect")
            },
            async () => {
                await showImage("alien", 'https://pixijs.com/assets/flowerTop.png')
            },
            () => {
                showImageWithDisolveEffect("alien", 'https://pixijs.com/assets/eggHead.png', 0.01)
                setDialogue("You can also show a image with a dissolve effect with the function showImageWithDisolveEffect")
            }
        ]
    }
}
