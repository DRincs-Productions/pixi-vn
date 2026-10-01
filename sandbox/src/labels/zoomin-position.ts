import { Assets, canvas, zoomIn } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

const imageAlias = "zoomin-position-image";
const imageSource = "data:image/svg+xml,";
const lateAlias = "zoomin-position-late-image";
const imageUrl = `${imageSource}${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" rx="12" fill="#e09f3e"/></svg>')}`;

registerTestLabel(
    "zoomin-position",
    "Canvas: zoomIn preserves alignment",
    [
        async () => {
            Assets.add({ alias: imageAlias, src: imageUrl });
            await Assets.load(imageAlias);
            canvas.clear();
            await zoomIn("zoom-image", {
                value: [imageAlias],
                options: { scale: 0.5, xAlign: 0.7 },
            });
            narration.dialogue = {
                text: "zoomIn should finish aligned at xAlign 0.7. Continue to zoom in an image that is NOT loaded yet.",
            };
        },
        async () => {
            // Registered but deliberately not loaded: the container's size is only known after zoomIn
            // loads it, and its destination/pivot must be computed from that size, not from an empty one.
            Assets.add({ alias: lateAlias, src: imageUrl });
            canvas.clear();
            await zoomIn("zoom-late-image", {
                value: [lateAlias],
                options: { anchor: 0.5, xAlign: 0.5, yAlign: 0.5 },
            });
            narration.dialogue = {
                text: "zoomIn of a not-yet-loaded image container: it should zoom in and end exactly at the center of the canvas. Continue to replace it with a zoom out of the old one.",
            };
        },
        async () => {
            await zoomIn(
                "zoom-late-image",
                {
                    value: [imageAlias],
                    options: { anchor: 0.5, xAlign: 0.5, yAlign: 0.5 },
                },
                { animateOldComponentOut: true },
            );
            narration.dialogue = {
                text: "zoomIn with animateOldComponentOut: the old image zooms out while the new one zooms in, both around the canvas center.",
            };
        },
    ],
    "Canvas regressions",
);
