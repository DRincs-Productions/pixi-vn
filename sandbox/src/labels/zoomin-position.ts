import { Assets, canvas, zoomIn } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const imageAlias = "zoomin-position-image";
const imageSource = "data:image/svg+xml,";
const imageUrl = `${imageSource}${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" rx="12" fill="#e09f3e"/></svg>')}`;

registerTestLabel("zoomin-position", "Canvas: zoomIn preserves alignment", [
    async () => {
        Assets.add({ alias: imageAlias, src: imageUrl });
        await Assets.load(imageAlias);
        canvas.clear();
        await zoomIn("zoom-image", {
            value: [imageAlias],
            options: { scale: 0.5, xAlign: 0.7 },
        });
        narration.dialogue = {
            text: "zoomIn should finish aligned at xAlign 0.7. Continue to inspect the final position.",
        };
    },
],
    "Canvas regressions",
);
