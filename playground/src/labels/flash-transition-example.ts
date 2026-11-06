import { Assets, canvas, transitions } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const imageA = "flash-example-a";
const imageB = "flash-example-b";

function imageData(color: string, width: number, height: number) {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="${color}"/></svg>`)}`;
}

registerTestLabel(
    "flash-transition-example",
    "Canvas: flash transition",
    [
        async () => {
            Assets.add({ alias: imageA, src: imageData("#ef8354", 320, 240) });
            Assets.add({ alias: imageB, src: imageData("#2f6690", 180, 320) });
            await Assets.load([imageA, imageB]);
            canvas.clear();
            await transitions.flashIn("flash-image", imageA, { duration: 0.4 });
            narration.dialogue = {
                text: "flashIn (white, default, new element): the orange image should appear, flash white, then settle to normal. Continue to replace it with a differently-sized image.",
            };
        },
        async () => {
            await transitions.flashIn("flash-image", imageB, {
                color: 0xffee00,
                duration: 0.3,
            });
            narration.dialogue = {
                text: "flashIn (yellow, replace): the orange image should fade to solid yellow, then be swapped for the taller/narrower blue image (still yellow), which fades back to normal. The swap itself should be invisible - only the color washes through. Continue to test flashOut.",
            };
        },
        async () => {
            transitions.flashOut("flash-image", { color: 0xff0000, duration: 0.4 });
            narration.dialogue = {
                text: "flashOut (red): the blue image should fade to solid red, fade back to normal, then disappear immediately with a hard cut - no additional dissolve.",
            };
        },
    ],
    "Canvas transitions",
);
