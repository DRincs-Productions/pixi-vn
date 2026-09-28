import { Assets, canvas, effects, showImage } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";
import { stripedTriangleSvg } from "./targets";

const image = "filter-effects-example-target";
const background = "filter-effects-example-background";

registerTestLabel(
    "filter-effects-example",
    "Canvas: filter-based animation effects",
    [
        async () => {
            Assets.add({
                alias: image,
                src: `data:image/svg+xml,${encodeURIComponent(stripedTriangleSvg("#ef8354", "#2f6690"))}`,
            });
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
            // A vignette darkens the corners of the element's own rectangle, so it's shown on a
            // full-canvas background (the triangle's corners are transparent - nothing to darken).
            const { width, height } = canvas;
            const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<defs><pattern id="d" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
<rect width="40" height="40" fill="#efe4cf"/><rect width="20" height="40" fill="#d9c7a3"/></pattern></defs>
<rect width="${width}" height="${height}" fill="url(#d)"/></svg>`;
            Assets.add({ alias: background, src: `data:image/svg+xml,${encodeURIComponent(bg)}` });
            // `zIndex` is the child index here: 0 puts the background under the triangle.
            await showImage(background, undefined, { zIndex: 0 });
            await effects.vignettePulseEffect(background, { pulses: 2, duration: 2 });
            narration.dialogue = {
                text: "vignettePulseEffect (on a full-canvas background): the corners and edges of the background should darken towards black and recover, twice. Continue to run desaturateEffect.",
            };
        },
        async () => {
            canvas.remove(background);
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
