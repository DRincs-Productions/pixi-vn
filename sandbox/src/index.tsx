import { Container, Game, canvas, sound } from "@drincs/pixi-vn";
import { createRoot } from "react-dom/client";

// Canvas setup with PIXI
const body = document.body;
if (!body) {
  throw new Error("body element not found");
}

Game.init(body, {}).then(() => {
  // Pixi.JS UI Layer
  canvas.addLayer("ui", new Container());

  // Sound setup
  sound.addChannel("bgm", { background: true });
  sound.addChannel("sfx");
  sound.defaultChannelAlias = "sfx";

  // React setup with ReactDOM
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("root element not found");
  }

  const htmlLayout = canvas.addHtmlLayer("ui", root);
  if (!htmlLayout) {
    throw new Error("htmlLayout not found");
  }
  const reactRoot = createRoot(htmlLayout);

  reactRoot.render(
    <div
      style={{
        color: "white",
        position: "absolute",
        bottom: 0,
        left: 0,
      }}
    >
      Loading...
    </div>,
  );
});
