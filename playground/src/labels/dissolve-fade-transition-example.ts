import {
    Assets,
    canvas,
    removeWithFade,
    showWithDissolve,
    showWithFade,
} from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const imageA = "dissolve-fade-example-a";
const imageB = "dissolve-fade-example-b";

function imageData(color: string) {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="${color}"/></svg>`)}`;
}

registerTestLabel(
    "dissolve-fade-transition-example",
    "Canvas: dissolve/fade transition",
    [
        async () => {
            Assets.add({ alias: imageA, src: imageData("#ef8354") });
            Assets.add({ alias: imageB, src: imageData("#2f6690") });
            await Assets.load([imageA, imageB]);
            canvas.clear();
            await showWithDissolve("dissolve-image", imageA, { duration: 1 });
            narration.dialogue = {
                text: "showWithDissolve: the orange image should fade in from transparent. Continue to replace it with showWithFade.",
            };
        },
        async () => {
            await showWithFade("dissolve-image", imageB, { duration: 1 });
            narration.dialogue = {
                text: "showWithFade (replace): the orange image should fade out while the blue image fades in over it - removeWithFade/removeWithDissolve are the same effect under the hood. Continue to remove it.",
            };
        },
        async () => {
            removeWithFade("dissolve-image", { duration: 1 });
            narration.dialogue = {
                text: "removeWithFade: the blue image should fade out and be removed.",
            };
        },
    ],
    "Canvas transitions",
);
