import {
    Assets,
    showImage,
    showWithDissolve,
    showWithFade
} from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const firstImage = "transition-position-first";
const secondImage = "transition-position-second";
const imagePosition = { x: 420, y: 260, anchor: 0.5 };

function imageData(color: string) {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" rx="12" fill="${color}"/></svg>`)}`;
}

registerTestLabel("canvas-transition-position", "Canvas: transition preserves position", [
    async () => {
        Assets.add({ alias: firstImage, src: imageData("#ef8354") });
        Assets.add({ alias: secondImage, src: imageData("#2f6690") });
        await Assets.load([firstImage, secondImage]);
        await showImage("transition-image", firstImage, imagePosition);
        narration.dialogue = {
            text: "The first image is positioned away from the origin. Continue to test dissolve.",
        };
    },
    async () => {
        await showWithDissolve("transition-image", secondImage, { duration: 2 });
        narration.dialogue = {
            text: "Dissolve should keep the image at the same position. Continue to test fade.",
        };
    },
    async () => {
        await showWithFade("transition-image", firstImage, { duration: 2 });
        narration.dialogue = {
            text: "Fade should keep the image at the same position.",
        };
    },
],
    "Canvas regressions",
);
