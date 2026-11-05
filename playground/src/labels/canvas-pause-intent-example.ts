import {
    type AnimatedSprite,
    Assets,
    canvas,
    showAnimatedSprite,
    showVideo,
    type VideoSprite,
} from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

// Aliases registered at import time, so they also resolve when a save is loaded or the player goes back.
const FIGHTER = "playground-pause-fighter";
const DIGITS = "playground-pause-digits";
const VIDEO = "playground-pause-video";
for (const [alias, src, data] of [
    [FIGHTER, "https://pixijs.com/assets/spritesheet/fighter.json", undefined],
    [DIGITS, "https://pixijs.com/assets/spritesheet/0123456789.json", undefined],
    // muted so the browser allows playback without a user gesture
    [VIDEO, "https://pixijs.com/assets/video.mp4", { muted: true, autoPlay: false }],
] as const) {
    if (!Assets.resolver.hasKey(alias)) {
        Assets.add({ alias, src, data });
    }
}

/**
 * canvas.pause() is a temporary suspension: stop()/pause()/play() called while the canvas is paused must
 * be applied by canvas.resume(), not overwritten by it.
 */
registerTestLabel(
    "canvas-pause-intent-example",
    "Canvas: pause/resume keeps explicit playback changes",
    [
        async () => {
            canvas.clear();
            await showAnimatedSprite(FIGHTER, {
                anchor: 0.5,
                align: { x: 0.2, y: 0.5 },
                animationSpeed: 0.3,
            });
            const digits = await showAnimatedSprite(
                DIGITS,
                { useFrameDurations: true },
                { anchor: 0.5, align: { x: 0.8, y: 0.5 } },
            );
            digits.gotoAndStop(3);
            await showVideo(VIDEO, {
                loop: true,
                anchor: 0.5,
                align: { x: 0.5, y: 0.5 },
                scale: 0.4,
            });
            narration.dialogue = {
                text: "The fighter (left) and the video (center) play, the digits (right) are stopped on 3. Continue: canvas.pause().",
            };
        },
        () => {
            canvas.pause();
            narration.dialogue = {
                text: "canvas.pause() was called. Continue: fighter.stop(), video.pause() and digits.play() are called while paused.",
            };
        },
        () => {
            canvas.find<AnimatedSprite>(FIGHTER)?.stop();
            canvas.find<VideoSprite>(VIDEO)?.pause();
            canvas.find<AnimatedSprite>(DIGITS)?.play();
            narration.dialogue = {
                text: "Requested while paused: fighter stopped, video paused, digits playing. Save here and check the memory. Continue: canvas.resume().",
            };
        },
        () => {
            canvas.resume();
            narration.dialogue = {
                text: "canvas.resume(): the fighter and the video must stay stopped, the digits must play.",
            };
        },
    ],
    "Canvas components",
);
