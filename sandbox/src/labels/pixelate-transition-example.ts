import { Assets, canvas, transitions } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const imageA = "pixelate-example-a";
const imageB = "pixelate-example-b";

function imageData(color: string) {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="${color}"/><circle cx="160" cy="120" r="60" fill="white"/></svg>`)}`;
}

registerTestLabel("pixelate-transition-example", "Canvas: pixelate transition", [
    async () => {
        Assets.add({ alias: imageA, src: imageData("#ef8354") });
        Assets.add({ alias: imageB, src: imageData("#2f6690") });
        await Assets.load([imageA, imageB]);
        canvas.clear();
        await transitions.pixelateIn("pixelate-image", imageA, { duration: 1.5 });
        narration.dialogue = {
            text: "pixelateIn (default pixel size 32): the orange image should start heavily pixelated and resolve into focus. Continue for a stronger, slower pixelation.",
        };
    },
    async () => {
        await transitions.pixelateIn("pixelate-image", imageB, { pixelSize: 64, duration: 2 });
        narration.dialogue = {
            text: "pixelateIn (pixel size 64): should start even blockier and resolve smoothly. Continue to test pixelateOut.",
        };
    },
    async () => {
        transitions.pixelateOut("pixelate-image", { pixelSize: 48, duration: 1.5 });
        narration.dialogue = {
            text: "pixelateOut (pixel size 48): the image should pixelate into blocks, then be removed.",
        };
    },
]);
