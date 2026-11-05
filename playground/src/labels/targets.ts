import { Assets } from "@drincs/pixi-vn/canvas";

/**
 * A striped triangle with a high-contrast white/black target. Distortion filters (glitch, RGB split,
 * shockwave, zoom blur, twist, pinch...) move pixels around, so they only read on an image with
 * detail - on a flat color they look like nothing happened.
 */
export function stripedTriangleSvg(stripeA: string, stripeB: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="280">
<defs><pattern id="s" width="24" height="24" patternUnits="userSpaceOnUse">
<rect width="24" height="12" fill="${stripeA}"/><rect y="12" width="24" height="12" fill="${stripeB}"/>
</pattern></defs>
<polygon points="160,12 308,268 12,268" fill="url(#s)" stroke="#ffffff" stroke-width="8" stroke-linejoin="round"/>
<circle cx="160" cy="180" r="46" fill="#ffffff"/>
<circle cx="160" cy="180" r="22" fill="#000000"/>
</svg>`;
}

/** Registers the orange/blue and green/purple striped-triangle assets under the given aliases. */
export async function loadStripedTargets(aliasA: string, aliasB: string): Promise<void> {
    Assets.add({
        alias: aliasA,
        src: `data:image/svg+xml,${encodeURIComponent(stripedTriangleSvg("#ef8354", "#2f6690"))}`,
    });
    Assets.add({
        alias: aliasB,
        src: `data:image/svg+xml,${encodeURIComponent(stripedTriangleSvg("#6ab04c", "#8e44ad"))}`,
    });
    await Assets.load([aliasA, aliasB]);
}
