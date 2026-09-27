import { Assets, canvas, effects, showImage } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const image = "filter-effects-example-target";

// Distortion filters (glitch, RGB split, shockwave, zoom blur) only show where the image has detail -
// on a flat color they move pixels of the same color around and look like nothing happened. A striped
// triangle with a high-contrast white/black target makes every effect readable.
const targetSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="280">
<defs><pattern id="s" width="24" height="24" patternUnits="userSpaceOnUse">
<rect width="24" height="12" fill="#ef8354"/><rect y="12" width="24" height="12" fill="#2f6690"/>
</pattern></defs>
<polygon points="160,12 308,268 12,268" fill="url(#s)" stroke="#ffffff" stroke-width="8" stroke-linejoin="round"/>
<circle cx="160" cy="180" r="46" fill="#ffffff"/>
<circle cx="160" cy="180" r="22" fill="#000000"/>
</svg>`;

registerTestLabel(
    "filter-effects-example",
    "Canvas: filter-based animation effects",
    [
        async () => {
            Assets.add({ alias: image, src: `data:image/svg+xml,${encodeURIComponent(targetSvg)}` });
            canvas.clear();
            await showImage(image, undefined, {
                x: canvas.width / 2,
                y: canvas.height / 2,
                anchor: 0.5,
            });
            narration.dialogue = {
                text: "A striped triangle with a white/black target should be centered on the canvas. Continue to run glitchEffect.",
            };
        },
        async () => {
            await effects.glitchEffect(image, { duration: 1.2 });
            narration.dialogue = {
                text: "glitchEffect: horizontal slices should jerk left/right with red/blue color fringing, in 3 shrinking bursts, then snap back clean. Continue to run chromaticAberrationEffect.",
            };
        },
        async () => {
            await effects.chromaticAberrationEffect(image, { strength: 12, bursts: 2, duration: 1.5 });
            narration.dialogue = {
                text: "chromaticAberrationEffect: red and blue ghosts should split left/right off every white/black edge and snap back, twice. Continue to run shockwaveEffect.",
            };
        },
        async () => {
            await effects.shockwaveEffect(image, { duration: 1.5 });
            narration.dialogue = {
                text: "shockwaveEffect: a ring should ripple outward from the center of the target, bending the stripes as it passes, until it leaves the triangle. Continue to run radialBlurEffect.",
            };
        },
        async () => {
            await effects.radialBlurEffect(image, { strength: 0.3, bursts: 2, duration: 1.5 });
            narration.dialogue = {
                text: "radialBlurEffect: the image should streak outward from its center (zoom blur), twice, then settle back sharp. Continue to run blurPulseEffect.",
            };
        },
        async () => {
            await effects.blurPulseEffect(image, { strength: 10, pulses: 3 });
            narration.dialogue = {
                text: "blurPulseEffect: the image should blur in and out repeatedly, each pulse smaller, settling back to sharp. Continue to run vignettePulseEffect.",
            };
        },
        async () => {
            await effects.vignettePulseEffect(image, { strength: 1, pulses: 2 });
            narration.dialogue = {
                text: "vignettePulseEffect: darkened edges should pulse in and out around the image. Continue to run desaturateEffect.",
            };
        },
        async () => {
            await effects.desaturateEffect(image, { amount: 0, duration: 0.4, holdDuration: 0.3 });
            narration.dialogue = {
                text: "desaturateEffect: the image's colors should drain to grayscale, hold briefly, then recover to full color. Continue to run glowPulseEffect.",
            };
        },
        async () => {
            await effects.glowPulseEffect(image, { strength: 6, pulses: 3, color: 0xffee00 });
            narration.dialogue = {
                text: "glowPulseEffect: a yellow glow should pulse outward from the triangle's edges repeatedly, each pulse smaller, settling back to no glow. Close this label to go back to the menu.",
            };
        },
    ],
    "Canvas effects",
);
