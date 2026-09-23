import { Assets, canvas, transitions } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const imageA = "split-example-a";
const imageB = "split-example-b";

function imageData(color: string) {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="${color}"/></svg>`)}`;
}

registerTestLabel("split-transition-example", "Canvas: split transition", [
    async () => {
        Assets.add({ alias: imageA, src: imageData("#ef8354") });
        Assets.add({ alias: imageB, src: imageData("#2f6690") });
        await Assets.load([imageA, imageB]);
        canvas.clear();
        await transitions.splitIn("split-image", imageA, { duration: 1.5 });
        narration.dialogue = {
            text: "splitIn (vertical, centered): two panels should slide together from the top/bottom edges to reveal the orange image. Continue for a horizontal, off-center split.",
        };
    },
    async () => {
        await transitions.splitIn("split-image", imageB, {
            orientation: "horizontal",
            origin: 0.25,
            duration: 1.5,
        });
        narration.dialogue = {
            text: "splitIn (horizontal, origin 0.25): panels should slide together from the left/right edges toward a line a quarter of the way across. Continue to test splitOut.",
        };
    },
    async () => {
        transitions.splitOut("split-image", { duration: 1.5 });
        narration.dialogue = {
            text: "splitOut (vertical, centered, curtain-like): two panels should retract apart toward the top/bottom edges to conceal the image, which is then removed.",
        };
    },
],
    "Canvas transitions",
);
