import {
    addAnimatedSprite,
    type AnimatedSprite,
    canvas,
    showAnimatedSprite,
} from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const MC = "https://pixijs.com/assets/spritesheet/mc.json";
const FIGHTER = "https://pixijs.com/assets/spritesheet/fighter.json";
const DIGITS = "https://pixijs.com/assets/spritesheet/0123456789.json";

/**
 * Exercises AnimatedSprite with real spritesheets and real ticker timing: frame order (natural sort),
 * animationSpeed, pause/resume, gotoAndStop, per-frame durations (Aseprite export) and the restore of
 * the current frame / playing state when going back.
 */
registerTestLabel(
    "animated-sprite-example",
    "Canvas: AnimatedSprite",
    [
        async () => {
            canvas.clear();
            await showAnimatedSprite("explosion", MC, {
                anchor: 0.5,
                align: { x: 0.2, y: 0.5 },
                animationSpeed: 0.5,
            });
            await showAnimatedSprite("fighter", FIGHTER, {
                anchor: 0.5,
                align: 0.5,
                animationSpeed: 0.3,
            });
            await showAnimatedSprite(
                "digits",
                { spritesheet: DIGITS, useFrameDurations: true },
                { anchor: 0.5, align: { x: 0.8, y: 0.5 } },
            );
            narration.dialogue = {
                text: "Left: explosion (27 frames, in order 1..27). Center: fighter rolling. Right: digits 0-9, one every 500 ms (Aseprite durations).",
            };
        },
        () => {
            canvas.find<AnimatedSprite>("fighter")?.stop();
            const explosion = canvas.find<AnimatedSprite>("explosion");
            if (explosion) {
                explosion.animationSpeed = 0.1;
            }
            narration.dialogue = {
                text: "The fighter is paused, the explosion is slower. Go back: the fighter must play again at its old frame.",
            };
        },
        () => {
            canvas.find<AnimatedSprite>("fighter")?.play();
            canvas.find<AnimatedSprite>("digits")?.gotoAndStop(7);
            narration.dialogue = {
                text: "The fighter plays again, the digits are stopped on 7.",
            };
        },
        async () => {
            await showAnimatedSprite(
                "fighter",
                {
                    spritesheet: FIGHTER,
                    frames: ["rollSequence0000.png", "rollSequence0010.png", "rollSequence0020.png"],
                },
                { animationSpeed: 0.05 },
            );
            narration.dialogue = {
                text: "The fighter was replaced (same alias) by a 3-frame animation: it keeps its position and anchor.",
            };
        },
        () => {
            canvas.remove("explosion");
            addAnimatedSprite("explosion-lazy", MC, {
                anchor: 0.5,
                align: { x: 0.2, y: 0.5 },
                animationSpeed: 0.5,
            });
            narration.dialogue = {
                text: "The explosion was removed and 'explosion-lazy' was added with addAnimatedSprite: nothing must be visible on the left yet.",
            };
        },
        async () => {
            const lazy = canvas.find<AnimatedSprite>("explosion-lazy");
            if (lazy) {
                lazy.setFrame(13, true);
                await lazy.load();
            }
            canvas.find<AnimatedSprite>("digits")?.gotoAndPlay(0);
            narration.dialogue = {
                text: "load() was called: the explosion starts from frame 13 and plays. The digits play again from 0. Save, reload and go back here: frames and playing state must match.",
            };
        },
    ],
    "Canvas components",
);
