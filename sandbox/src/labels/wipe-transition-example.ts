import { Assets, canvas, transitions } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const imageA = "wipe-example-a";
const imageB = "wipe-example-b";

function imageData(color: string) {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="${color}"/></svg>`)}`;
}

registerTestLabel("wipe-transition-example", "Canvas: wipe transition", [
    async () => {
        Assets.add({ alias: imageA, src: imageData("#ef8354") });
        Assets.add({ alias: imageB, src: imageData("#2f6690") });
        await Assets.load([imageA, imageB]);
        canvas.clear();
        await transitions.wipeIn("wipe-image", imageA, { duration: 1.5 });
        narration.dialogue = {
            text: "wipeIn (angle 0): the orange image should sweep in left-to-right. Continue for a diagonal wipe.",
        };
    },
    async () => {
        await transitions.wipeIn("wipe-image", imageB, { angle: 45, duration: 1.5 });
        narration.dialogue = {
            text: "wipeIn (angle 45): the blue image should sweep in diagonally. Continue for an inverted wipe.",
        };
    },
    async () => {
        await transitions.wipeIn("wipe-image", imageA, { angle: 90, invert: true, duration: 1.5 });
        narration.dialogue = {
            text: "wipeIn (angle 90, invert): should reveal from the opposite side of a plain 90° wipe. Continue to test wipeOut.",
        };
    },
    async () => {
        transitions.wipeOut("wipe-image", { angle: 180, duration: 1.5 });
        narration.dialogue = { text: "wipeOut (angle 180): the image should wipe away and be removed." };
    },
],
    "Canvas transitions",
);
