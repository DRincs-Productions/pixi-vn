import { Assets, canvas, pushIn, pushOut } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const imageA = "push-example-a";
const imageB = "push-example-b";

function imageData(color: string) {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="${color}"/></svg>`)}`;
}

registerTestLabel(
    "push-transition-example",
    "Canvas: push transition",
    [
        async () => {
            Assets.add({ alias: imageA, src: imageData("#ef8354") });
            Assets.add({ alias: imageB, src: imageData("#2f6690") });
            await Assets.load([imageA, imageB]);
            canvas.clear();
            await pushIn("push-image", imageA, { direction: "left", duration: 1 });
            narration.dialogue = {
                text: "pushIn (from left): the orange image should push in from the left edge, filling the canvas. Continue to replace it with a push from the right - the old image should be pushed out as the new one pushes in.",
            };
        },
        async () => {
            await pushIn("push-image", imageB, { direction: "right", duration: 1 });
            narration.dialogue = {
                text: "pushIn (from right, replace): the orange image should be pushed out to the left as the blue image pushes in from the right. Continue to remove it.",
            };
        },
        async () => {
            pushOut("push-image", { direction: "up", duration: 1 });
            narration.dialogue = {
                text: "pushOut (to top): the blue image should be pushed off the top of the canvas and removed.",
            };
        },
    ],
    "Canvas transitions",
);
