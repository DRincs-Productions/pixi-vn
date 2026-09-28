import { Assets, canvas, moveIn, moveOut } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const imageA = "move-example-a";
const imageB = "move-example-b";

function imageData(color: string) {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect width="200" height="150" fill="${color}"/></svg>`)}`;
}

registerTestLabel(
    "move-transition-example",
    "Canvas: move transition",
    [
        async () => {
            Assets.add({ alias: imageA, src: imageData("#ef8354") });
            Assets.add({ alias: imageB, src: imageData("#2f6690") });
            await Assets.load([imageA, imageB]);
            canvas.clear();
            await moveIn("move-image", imageA, { direction: "left", duration: 1 });
            narration.dialogue = {
                text: "moveIn (from left): the orange image should slide in from the left edge to its resting position. Continue to replace it, moving out via the right edge.",
            };
        },
        async () => {
            await moveIn("move-image", imageB, {
                direction: "right",
                duration: 1,
                removeOldComponentWithMoveOut: true,
            });
            narration.dialogue = {
                text: "moveIn (from right, replace): the orange image should slide out to the left while the blue image slides in from the right. Continue to remove it.",
            };
        },
        async () => {
            moveOut("move-image", { direction: "down", duration: 1 });
            narration.dialogue = {
                text: "moveOut (to bottom): the blue image should slide down off the canvas and be removed. Continue for motionBlur.",
            };
        },
        async () => {
            await moveIn("move-image", imageA, { direction: "left", duration: 1, motionBlur: true });
            narration.dialogue = {
                text: "moveIn with motionBlur: the orange image should slide in from the left with a horizontal smear that fades out as it stops, ending sharp. Continue to move it out with motionBlur.",
            };
        },
        async () => {
            moveOut("move-image", { direction: "up", duration: 1, motionBlur: 60 });
            narration.dialogue = {
                text: "moveOut with motionBlur: 60: the image should slide up with a strong vertical smear and be removed.",
            };
        },
    ],
    "Canvas transitions",
);
