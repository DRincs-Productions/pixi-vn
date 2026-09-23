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
    // Match the backing buffer to the displayed size. Upscaling the default 800x600
    // canvas in CSS otherwise softens every outer edge, including unmasked images.
    const syncRenderResolution = () => {
        const app = canvas.app;
        const element = app.canvas;
        const rect = element.getBoundingClientRect();
        const resolution = (rect.width / app.screen.width) * window.devicePixelRatio;
        if (resolution <= 0 || Math.abs(app.renderer.resolution - resolution) < 0.001) {
            return;
        }
        // Pixi's autoDensity rewrites the CSS dimensions when resizing the buffer;
        // retain the contain layout already calculated by the engine.
        const { width, height } = element.style;
        app.renderer.resize(app.screen.width, app.screen.height, resolution);
        element.style.width = width;
        element.style.height = height;
    };
    new ResizeObserver(syncRenderResolution).observe(canvas.app.canvas);
    window.addEventListener("resize", syncRenderResolution);
    syncRenderResolution();

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
