import { Assets, canvas, effects, showImage } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const image = "filter-effects-example-target";

function imageData(color: string, width: number, height: number) {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="${color}"/></svg>`)}`;
}

registerTestLabel(
    "filter-effects-example",
    "Canvas: filter-based animation effects",
    [
        async () => {
            Assets.add({ alias: image, src: imageData("#2f6690", 200, 200) });
            canvas.clear();
            await showImage(image, undefined, {
                x: canvas.width / 2,
                y: canvas.height / 2,
                anchor: 0.5,
            });
            narration.dialogue = {
                text: "A blue square should be centered on the canvas. Continue to run glitchEffect.",
            };
        },
        async () => {
            await effects.glitchEffect(image, { strength: 40, bursts: 3 });
            narration.dialogue = {
                text: "glitchEffect: the square should show a decaying burst of digital-corruption slice displacement, settling back to normal. Continue to run chromaticAberrationEffect.",
            };
        },
        async () => {
            await effects.chromaticAberrationEffect(image, { strength: 12, bursts: 2 });
            narration.dialogue = {
                text: "chromaticAberrationEffect: the red/blue channels should split apart and snap back, in a decaying burst. Continue to run shockwaveEffect.",
            };
        },
        async () => {
            await effects.shockwaveEffect(image, { radius: 300, speed: 400 });
            narration.dialogue = {
                text: "shockwaveEffect: a single ripple distortion should travel outward from the center and fade. Continue to run radialBlurEffect.",
            };
        },
        async () => {
            await effects.radialBlurEffect(image, { strength: 0.8, bursts: 2 });
            narration.dialogue = {
                text: "radialBlurEffect: a decaying burst of zoom-blur should radiate from the center and settle back to sharp. Continue to run blurPulseEffect.",
            };
        },
        async () => {
            await effects.blurPulseEffect(image, { strength: 10, pulses: 3 });
            narration.dialogue = {
                text: "blurPulseEffect: the square should blur in and out repeatedly, each pulse smaller, settling back to sharp. Continue to run vignettePulseEffect.",
            };
        },
        async () => {
            await effects.vignettePulseEffect(image, { strength: 1, pulses: 2 });
            narration.dialogue = {
                text: "vignettePulseEffect: darkened edges should pulse in and out around the square. Continue to run desaturateEffect.",
            };
        },
        async () => {
            await effects.desaturateEffect(image, { amount: 0, duration: 0.4, holdDuration: 0.3 });
            narration.dialogue = {
                text: "desaturateEffect: the square's color should drain to grayscale, hold briefly, then recover to full color. Continue to run glowPulseEffect.",
            };
        },
        async () => {
            await effects.glowPulseEffect(image, { strength: 6, pulses: 3, color: 0xffee00 });
            narration.dialogue = {
                text: "glowPulseEffect: a yellow glow should pulse outward from the square's edges repeatedly, each pulse smaller, settling back to no glow. Close this label to go back to the menu.",
            };
        },
    ],
    "Canvas effects",
);
