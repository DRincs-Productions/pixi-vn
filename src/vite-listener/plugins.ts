import { RegisteredCharacters } from "@drincs/pixi-vn/characters";
import { RegisteredLabels } from "@drincs/pixi-vn/narration";
import { Assets } from "@drincs/pixi-vn/pixi.js";

/**
 * Function that setup the pixivn vite listener, it will send to the vite server the list of characters and labels registered.
 */
export function setupPixivnViteListener() {
    const characters = RegisteredCharacters.values();
    fetch("/pixi-vn/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(characters),
    });
    const labels = RegisteredLabels.keys();
    fetch("/pixi-vn/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(labels),
    });
    // list all assets
    const assets = Assets.resolver;
    fetch("/pixi-vn/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assets),
    });
}
