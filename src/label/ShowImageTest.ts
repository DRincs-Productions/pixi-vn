import { Label } from "../lib/classes/Label";
import { TickerRotate } from "../lib/classes/ticker/TickerRotate";
import { labelDecorator } from "../lib/decorators/LabelDecorator";
import { setDialogue } from "../lib/functions/DialogueUtility";
import { removeImage, showImage, showImageAsync, showImageAsyncWithDisolveEffect, showImageWithEffect } from "../lib/functions/ImageUtility";
import { StepLabelType } from "../lib/types/StepLabelType";

@labelDecorator()
export class ShowImageTest extends Label {
    override get steps(): StepLabelType[] {
        return [
            () => {
                let bunny1 = showImage("bunny1", "https://pixijs.com/assets/eggHead.png")
                bunny1.x = 100
                bunny1.y = 100
                showImageAsync("bunny2", "https://pixijs.com/assets/eggHead.png")
                    .then((bunny2) => {
                        console.log("bunny2 loaded")
                        bunny2.x = 300
                        bunny2.y = 100
                    })

                setDialogue("You can also add a image to the canvas with the function showImage or showImageAsync. If you want add a CanvasElements, you can use GameWindowManager.addChild")
            },
            () => setDialogue("In case the image is not in cache the function showImageAsync will load the image asynchronously. then you may see the image appear after."),
            () => setDialogue("showImageAsync may print error logs if you run showImage immediately after loading the same image (as in this case). To warn you that the image is already present in the cache and therefore the cache will be used."),
            () => {
                removeImage("bunny1")
                removeImage("bunny2")
                setDialogue("You can also remove a image from the canvas with the function removeImage")
            },
            () => {
                let alien = showImageWithEffect("alien", 'https://pixijs.com/assets/eggHead.png',
                    new TickerRotate({ speed: 0.1 }),
                )
                alien.anchor.set(0.5);
                alien.x = 100
                alien.y = 100
                setDialogue("You can also show a image with a effect with the function showImageWithEffect")
            },
            async () => {
                setDialogue("if you want to disable the Next button until the image is loaded you can use the wait button")
                await showImageAsync("alien", 'https://pixijs.com/assets/flowerTop.png')
            },
            () => {
                showImageAsyncWithDisolveEffect("alien", 'https://pixijs.com/assets/eggHead.png',
                    { speed: 0.3 },
                    1000
                )
            }
        ]
    }
}
