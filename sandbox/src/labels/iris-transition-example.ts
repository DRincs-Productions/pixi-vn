import { Assets, canvas, transitions } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const imageA = "iris-example-a";
const imageB = "iris-example-b";

function imageData(color: string) {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="${color}"/></svg>`)}`;
}

registerTestLabel("iris-transition-example", "Canvas: iris transition", [
    async () => {
        Assets.add({ alias: imageA, src: imageData("#ef8354") });
        Assets.add({ alias: imageB, src: imageData("#2f6690") });
        await Assets.load([imageA, imageB]);
        canvas.clear();
        await transitions.irisIn("iris-image", imageA, { duration: 1.5 });
        narration.dialogue = {
            text: "irisIn (centered): a circular mask should expand from the center to reveal the orange image. Continue for an off-center soft iris.",
        };
    },
    async () => {
        await transitions.irisIn("iris-image", imageB, {
            origin: { x: 0.2, y: 0.8 },
            softness: 25,
            duration: 1.5,
        });
        narration.dialogue = {
            text: "irisIn (origin near bottom-left, soft edge): the reveal should start from that corner with a feathered edge. Continue to test irisOut.",
        };
    },
    async () => {
        transitions.irisOut("iris-image", { aspect: 2, duration: 1.5 });
        narration.dialogue = {
            text: "irisOut (aspect 2, wide ellipse): the image should shrink away through a wide elliptical mask and be removed.",
        };
    },
],
    "Canvas transitions",
);
