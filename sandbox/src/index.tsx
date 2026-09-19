import { Container, Game, canvas, sound } from "@drincs/pixi-vn";
import { createRoot } from "react-dom/client";
import App from "./App";
import { START_LABEL_ID } from "./labels";

// Canvas setup with PIXI
const body = document.body;
if (!body) {
    throw new Error("body element not found");
}

Game.init(body, {}).then(async () => {
    // Pixi.JS UI Layer
    canvas.layers.add("ui", new Container());

    // Sound setup
    sound.channels.add("bgm", { background: true });
    sound.channels.add("sfx");
    sound.defaultChannelAlias = "sfx";

    // React setup with ReactDOM
    const root = document.getElementById("root");
    if (!root) {
        throw new Error("root element not found");
    }

    const htmlLayout = canvas.htmlLayers.add("ui", root);
    if (!htmlLayout) {
        throw new Error("htmlLayout not found");
    }
    const reactRoot = createRoot(htmlLayout);

    reactRoot.render(<App />);

    // Exposes window.pixiVN so a browser-driven test session (see the `pixi-vn-testing` skill)
    // can drive/inspect the sandbox. Never enable this in a production build.
    if (process.env.NODE_ENV !== "production") {
        Game.testing.enable();
        (window as any).pixiVN.canvas = canvas;
        (window as any).pixiVN.sound = sound;
    }

    // Boots the sandbox menu (sandbox/src/labels/start.ts), which lists every registered
    // test label as a choice.
    await Game.start(START_LABEL_ID, {});
});
