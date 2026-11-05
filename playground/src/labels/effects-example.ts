import { Assets, canvas, effects, showImage } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const image = "effects-example-target";

function imageData(color: string, width: number, height: number) {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="${color}"/></svg>`)}`;
}

registerTestLabel(
    "effects-example",
    "Canvas: articulated animation effects",
    [
        async () => {
            Assets.add({ alias: image, src: imageData("#ef8354", 160, 160) });
            canvas.clear();
            await showImage(image, undefined, {
                x: canvas.width / 2,
                y: canvas.height / 2,
                anchor: 0.5,
            });
            narration.dialogue = {
                text: "An orange square should be centered on the canvas. Continue to run bounceEffect.",
            };
        },
        async () => {
            await effects.bounceEffect(image, { direction: "up", distance: 60, bounces: 3 });
            narration.dialogue = {
                text: "bounceEffect: the square should bounce upward 3 times, each bounce lower than the last, and land back at its exact starting position. Continue to run pulseEffect.",
            };
        },
        async () => {
            await effects.pulseEffect(image, { scale: 1.4, pulses: 3 });
            narration.dialogue = {
                text: "pulseEffect: the square should pulse (scale up/down) 3 times, each pulse smaller, and return to its original size. Continue to run hopEffect.",
            };
        },
        async () => {
            await effects.hopEffect(image, { direction: "right", distance: 80, secondaryHops: 2 });
            narration.dialogue = {
                text: "hopEffect: the square should hop right once, then two smaller decaying follow-up hops, returning to its starting x each time. Continue to run wiggleEffect.",
            };
        },
        async () => {
            await effects.wiggleEffect(image, { angle: 25, repetitions: 4 });
            narration.dialogue = {
                text: "wiggleEffect: the square should rotate back and forth with decaying amplitude and settle back to its original rotation. Continue to run nodEffect.",
            };
        },
        async () => {
            await effects.nodEffect(image, { axis: "vertical", distance: 30, repetitions: 4 });
            narration.dialogue = {
                text: "nodEffect: the square should oscillate up/down with decaying amplitude and settle back to its original position. Continue to run swayEffect.",
            };
        },
        async () => {
            await effects.swayEffect(image, { distance: 20, angle: 8, repetitions: 3 });
            narration.dialogue = {
                text: "swayEffect: the square should smoothly drift side to side while rocking (rotation), settling back to its original position/rotation. Continue to run punchEffect.",
            };
        },
        async () => {
            await effects.punchEffect(image, { mode: "scale", strength: 0.5, overshoot: 0.4 });
            narration.dialogue = {
                text: "punchEffect (scale): a single fast scale-up impulse with a quick settle-back undershoot, returning to the original scale. Close this label to go back to the menu.",
            };
        },
    ],
    "Canvas effects",
);
