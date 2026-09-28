import { Assets, canvas, showImage } from "@drincs/pixi-vn/canvas";
import { filters } from "@drincs/pixi-vn/filters";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";
import { stripedTriangleSvg } from "./targets";

const image = "persistent-filters-image";

/**
 * `filters` comes from a PixiJS global type mixin (`PixiMixins.Container`) that the sandbox's CRA
 * TypeScript setup (old `moduleResolution`, can't even resolve `@drincs/pixi-vn/pixi.js`'s types)
 * doesn't pick up on `canvas.find()`'s return type - it's there at runtime.
 */
type WithFilters = { filters: readonly object[] | null };

function target(): WithFilters {
    const component = canvas.find(image);
    if (!component) {
        throw new Error(`"${image}" is not on the canvas`);
    }
    return component as unknown as WithFilters;
}

/**
 * Filters set directly on a canvas element (`component.filters`) must be saved with it: at every
 * step, go "Indietro" and "Continue" again - the triangle must show exactly the filters listed in that
 * step's text (check also `window.pixiVN.canvas.find("persistent-filters-image").filters`).
 */
registerTestLabel(
    "persistent-filters-example",
    "Canvas: persistent filters (save/restore)",
    [
        async () => {
            Assets.add({
                alias: image,
                src: `data:image/svg+xml,${encodeURIComponent(stripedTriangleSvg("#ef8354", "#2f6690"))}`,
            });
            canvas.clear();
            await showImage(image, undefined, { x: canvas.width / 2, y: canvas.height / 2, anchor: 0.5 });
            narration.dialogue = {
                text: "Filters: none. The orange/blue triangle is plain. Continue to add an old-film look.",
            };
        },
        () => {
            target().filters = [
                new filters.OldFilmFilter({ sepia: 0.8, noise: 0.25, scratch: 0.6, vignetting: 0.35 }),
            ];
            narration.dialogue = {
                text: "Filters: OldFilmFilter. The triangle should be sepia with grain, scratches and a vignette. Go Indietro: it must lose the look; Continue: it must get it back. Continue to add a yellow outline too.",
            };
        },
        () => {
            const component = target();
            component.filters = [
                ...(component.filters ?? []),
                new filters.OutlineFilter({ thickness: 6, color: 0xffee00 }),
            ];
            narration.dialogue = {
                text: "Filters: OldFilmFilter + OutlineFilter. Sepia triangle with a thick yellow outline. Continue to remove only the old-film look.",
            };
        },
        () => {
            const component = target();
            component.filters = (component.filters ?? []).filter(
                (f) => !(f instanceof filters.OldFilmFilter),
            );
            narration.dialogue = {
                text: "Filters: OutlineFilter. Original colors again, yellow outline still there. Continue to shift the hue.",
            };
        },
        () => {
            const component = target();
            component.filters = [
                ...(component.filters ?? []),
                new filters.HslAdjustmentFilter({ hue: 120, saturation: 0, lightness: 0, colorize: false, alpha: 1 }),
            ];
            narration.dialogue = {
                text: "Filters: OutlineFilter + HslAdjustmentFilter (hue +120). The stripes (and the outline) change color. Continue to remove every filter.",
            };
        },
        () => {
            target().filters = null;
            narration.dialogue = {
                text: "Filters: none. Back to the plain triangle. Walk Indietro through every step and check each one shows the filters its text lists.",
            };
        },
    ],
    "Canvas effects",
);
