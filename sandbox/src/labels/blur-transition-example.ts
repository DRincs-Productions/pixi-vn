import { Assets, canvas, transitions } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const imageA = "blur-example-a";
const imageB = "blur-example-b";

function imageData(color: string) {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="${color}"/><circle cx="160" cy="120" r="60" fill="white"/></svg>`)}`;
}

registerTestLabel("blur-transition-example", "Canvas: blur transition", [
    async () => {
        Assets.add({ alias: imageA, src: imageData("#ef8354") });
        Assets.add({ alias: imageB, src: imageData("#2f6690") });
        await Assets.load([imageA, imageB]);
        canvas.clear();
        await transitions.blurIn("blur-image", imageA, { duration: 1.5 });
        narration.dialogue = {
            text: "blurIn (default strength 32): the orange image should start heavily blurred and sharpen into focus. Continue for a stronger, slower blur.",
        };
    },
    async () => {
        await transitions.blurIn("blur-image", imageB, { strength: 60, duration: 2, quality: 6 });
        narration.dialogue = {
            text: "blurIn (strength 60, quality 6): should start even blurrier and sharpen smoothly. Continue to test blurOut.",
        };
    },
    async () => {
        transitions.blurOut("blur-image", { strength: 40, duration: 1.5 });
        narration.dialogue = {
            text: "blurOut (strength 40): the image should blur out of focus, then be removed.",
        };
    },
],
    "Canvas transitions",
);
