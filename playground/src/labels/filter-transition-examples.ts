import { canvas, transitions, type ImageSpriteOptions } from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";
import { loadStripedTargets } from "./targets";

/**
 * One small label per filter-based transition pair, all with the same three steps as
 * `blur-transition-example.ts`: xIn on an empty alias, xIn replacing the image, xOut.
 */
interface FilterTransitionExample {
    name: string;
    run: {
        in: (
            alias: string,
            image: { value: string; options: ImageSpriteOptions },
        ) => Promise<unknown>;
        out: (alias: string) => unknown;
    };
    looks: { in: string; replace: string; out: string };
}

const examples: FilterTransitionExample[] = [
    {
        name: "glitch",
        run: {
            in: (alias, image) => transitions.glitchIn(alias, image, { duration: 1.2 }),
            out: (alias) => transitions.glitchOut(alias, { duration: 1.2 }),
        },
        looks: {
            in: "the triangle should fade in through jittery slices with red/blue fringing that settle down",
            replace:
                "the green/purple triangle should glitch in over the orange one, which disappears at the end",
            out: "glitch bursts should build up while the triangle fades out, then it's removed",
        },
    },
    {
        name: "twist",
        run: {
            in: (alias, image) => transitions.twistIn(alias, image, { duration: 1.5 }),
            out: (alias) => transitions.twistOut(alias, { duration: 1.5 }),
        },
        looks: {
            in: "the triangle should unwind out of a swirl while fading in",
            replace: "the green/purple triangle should unwind over the orange one",
            out: "the triangle should wind up into a vortex while fading out, then it's removed",
        },
    },
    {
        name: "warp",
        run: {
            in: (alias, image) => transitions.warpIn(alias, image, { duration: 1.2 }),
            out: (alias) => transitions.warpOut(alias, { duration: 1.2 }),
        },
        looks: {
            in: "the triangle should arrive out of radial zoom-blur streaks, like leaving hyperspace",
            replace: "the green/purple triangle should warp in over the orange one",
            out: "the triangle should streak away radially while fading out, then it's removed",
        },
    },
    {
        name: "ripple",
        run: {
            in: (alias, image) => transitions.rippleIn(alias, image, { duration: 1.5 }),
            out: (alias) => transitions.rippleOut(alias, { duration: 1.5 }),
        },
        looks: {
            in: "the triangle should fade in while a water ring spreads from its center, bending the stripes",
            replace: "the green/purple triangle should ripple in over the orange one",
            out: "a water ring should spread over the triangle while it fades out, then it's removed",
        },
    },
    {
        name: "noise-dissolve",
        run: {
            in: (alias, image) => transitions.noiseDissolveIn(alias, image, { duration: 1.5 }),
            out: (alias) => transitions.noiseDissolveOut(alias, { duration: 1.5, edge: "soft" }),
        },
        looks: {
            in: "the triangle should appear in crisp, organic noise-shaped blotches",
            replace:
                "the green/purple triangle should dissolve in blotch by blotch over the orange one",
            out: "(soft edge) the triangle should disappear in a cloudy noise fade, then it's removed",
        },
    },
    {
        name: "tv",
        run: {
            in: (alias, image) => transitions.tvIn(alias, image, { duration: 0.9 }),
            out: (alias) => transitions.tvOut(alias, { duration: 0.9 }),
        },
        looks: {
            in: "a bright dot should stretch into a glowing line, then open up into the triangle, with scanlines",
            replace: "the green/purple triangle should switch on like a TV over the orange one",
            out: "the triangle should collapse into a glowing line, then a dot, like an old TV switching off",
        },
    },
    {
        name: "pinch",
        run: {
            in: (alias, image) => transitions.pinchIn(alias, image, { duration: 1.2 }),
            out: (alias) => transitions.pinchOut(alias, { duration: 1.2 }),
        },
        looks: {
            in: "the triangle should emerge from its center point, deforming outward as it settles",
            replace: "the green/purple triangle should pinch in over the orange one",
            out: "the triangle should be sucked into its center point while fading out, then it's removed",
        },
    },
];

for (const { name, run, looks } of examples) {
    const alias = `${name}-transition-image`;
    const imageA = `${name}-transition-a`;
    const imageB = `${name}-transition-b`;
    // Positioned (and centered-anchored) up front: tvIn/tvOut scale around the anchor.
    const image = (value: string) => ({
        value,
        options: { x: canvas.width / 2, y: canvas.height / 2, anchor: 0.5 },
    });
    registerTestLabel(
        `${name}-transition-example`,
        `Canvas: ${name} transition`,
        [
            async () => {
                await loadStripedTargets(imageA, imageB);
                canvas.clear();
                await run.in(alias, image(imageA));
                narration.dialogue = {
                    text: `${name}In (new element): ${looks.in}. Continue to replace it.`,
                };
            },
            async () => {
                await run.in(alias, image(imageB));
                narration.dialogue = {
                    text: `${name}In (replace): ${looks.replace}. Continue for ${name}Out.`,
                };
            },
            async () => {
                run.out(alias);
                narration.dialogue = { text: `${name}Out: ${looks.out}.` };
            },
        ],
        "Canvas transitions",
    );
}
