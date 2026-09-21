import { Assets, canvas, showImage, transitions } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const imageA = "transferred-ticker-a";
const imageB = "transferred-ticker-b";

function imageData(color: string) {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" rx="12" fill="${color}"/></svg>`)}`;
}

registerTestLabel("transferred-ticker-position", "Canvas: transferred ticker keeps its position", [
    async () => {
        Assets.add({ alias: imageA, src: imageData("#ef8354") });
        Assets.add({ alias: imageB, src: imageData("#2f6690") });
        await Assets.load([imageA, imageB]);
        canvas.clear();
        const alien = await showImage("alien", imageA, { anchor: 0.5, align: 0.5 });
        // A continuous, looping keyframe-array animation - like the one in the "heredity factor"
        // example - already running on the component when a transition swaps it out.
        canvas.animate(
            alien,
            { xAlign: [0, 1, 1, 0, 0], yAlign: [0, 0, 1, 1, 0] },
            { repeat: Infinity, duration: 10 },
        );
        await new Promise((resolve) => setTimeout(resolve, 1200));
        narration.dialogue = {
            text: "The orange square should be looping smoothly around the canvas. Continue to swap it via a dissolve transition mid-loop.",
        };
    },
    async () => {
        await transitions.showWithDissolve("alien", imageB);
        narration.dialogue = {
            text: "Regression check for issue #610: the blue square must keep animating smoothly through the swap - it must NOT flash back to the top-left corner (align 0,0) for a frame, however briefly. If you see a jump/flash, the ticker-transfer fix in MotionTickerBase regressed.",
        };
    },
],
    "Canvas regressions",
);
