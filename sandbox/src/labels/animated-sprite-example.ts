import {
    addAnimatedSprite,
    type AnimatedSprite,
    Assets,
    canvas,
    RegisteredEvents,
    showAnimatedSprite,
} from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

// Spritesheet aliases. They are registered when the module is imported (not inside a step), so they also
// resolve when a save is loaded or the player goes back without running the first step again.
const MC = "sandbox-mc";
const FIGHTER = "sandbox-fighter";
const DIGITS = "sandbox-digits";
for (const [alias, src] of [
    [MC, "https://pixijs.com/assets/spritesheet/mc.json"],
    [FIGHTER, "https://pixijs.com/assets/spritesheet/fighter.json"],
    [DIGITS, "https://pixijs.com/assets/spritesheet/0123456789.json"],
]) {
    if (!Assets.resolver.hasKey(alias)) {
        Assets.add({ alias, src });
    }
}

/** Savable "complete" listener (same as `@eventDecorator()`, registered by hand to avoid decorators here). */
function removeOnComplete(component: AnimatedSprite) {
    canvas.remove(component.label);
}
RegisteredEvents.add(removeOnComplete, "sandbox-animated-sprite-remove-on-complete");

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
            await showAnimatedSprite(MC, {
                anchor: 0.5,
                align: { x: 0.2, y: 0.5 },
                animationSpeed: 0.5,
            });
            await showAnimatedSprite(FIGHTER, {
                anchor: 0.5,
                align: 0.5,
                animationSpeed: 0.3,
            });
            // a source without spritesheet uses the alias as spritesheet
            await showAnimatedSprite(
                DIGITS,
                { useFrameDurations: true },
                { anchor: 0.5, align: { x: 0.8, y: 0.5 } },
            );
            narration.dialogue = {
                text: "Left: explosion (27 frames, in order 1..27). Center: fighter rolling. Right: digits 0-9, one every 500 ms (Aseprite durations).",
            };
        },
        () => {
            canvas.find<AnimatedSprite>(FIGHTER)?.stop();
            const explosion = canvas.find<AnimatedSprite>(MC);
            if (explosion) {
                explosion.animationSpeed = 0.1;
            }
            narration.dialogue = {
                text: "The fighter is paused, the explosion is slower. Go back: the fighter must play again at its old frame.",
            };
        },
        () => {
            canvas.find<AnimatedSprite>(FIGHTER)?.play();
            canvas.find<AnimatedSprite>(DIGITS)?.gotoAndStop(7);
            narration.dialogue = {
                text: "The fighter plays again, the digits are stopped on 7.",
            };
        },
        async () => {
            await showAnimatedSprite(
                FIGHTER,
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
            canvas.remove(MC);
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
            canvas.find<AnimatedSprite>(DIGITS)?.gotoAndPlay(0);
            narration.dialogue = {
                text: "load() was called: the explosion starts from frame 13 and plays. The digits play again from 0. Save, reload and go back here: frames and playing state must match.",
            };
        },
        async () => {
            canvas.clear();
            const once = await showAnimatedSprite("explosion-once", MC, {
                anchor: 0.5,
                align: 0.5,
                animationSpeed: 0.2,
                loop: false,
            });
            once.on("complete", removeOnComplete);
            narration.dialogue = {
                text: "A non-looping explosion with a saved 'complete' listener: it must disappear when it ends. Save before it ends and load: it must still disappear (listener restored, not fired by the restore).",
            };
        },
        async () => {
            // (alias, options) form: the alias of the component is also the spritesheet alias
            canvas.clear();
            await showAnimatedSprite(FIGHTER, { anchor: 0.5, align: 0.5, animationSpeed: 0.4 });
            narration.dialogue = {
                text: "showAnimatedSprite(alias, options): the fighter is loaded from the spritesheet registered with the same alias.",
            };
        },
    ],
    "Canvas components",
);
