import { Assets, canvas, transitions } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const imageA = "flash-example-a";
const imageB = "flash-example-b";

function imageData(color: string) {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="${color}"/></svg>`)}`;
}

registerTestLabel("flash-transition-example", "Canvas: flash transition", [
    async () => {
        Assets.add({ alias: imageA, src: imageData("#ef8354") });
        Assets.add({ alias: imageB, src: imageData("#2f6690") });
        await Assets.load([imageA, imageB]);
        canvas.clear();
        await transitions.flashIn("flash-image", imageA, { duration: 0.4 });
        narration.dialogue = {
            text: "flashIn (white, default): a white flash should cover the orange image then fade away, like a camera flash. Continue for a colored, multi-pulse flash.",
        };
    },
    async () => {
        await transitions.flashIn("flash-image", imageB, {
            color: 0xff0033,
            duration: 0.15,
            holdDuration: 0.05,
            pulses: 3,
        });
        narration.dialogue = {
            text: "flashIn (red, 3 pulses): the blue image should already be visible under 3 quick red pulses, like a damage flash. Continue to test flashOut.",
        };
    },
    async () => {
        transitions.flashOut("flash-image", { color: 0x000000, duration: 0.5 });
        narration.dialogue = {
            text: "flashOut (black, blink/cut): the image should be covered by a fade-to-black-and-back, then removed.",
        };
    },
]);
