import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import {
    AnimatedSprite,
    addAnimatedSprite,
    canvas,
    DEFAULT_ANIMATED_SPRITE_FRAME_TIME,
    getAnimatedSpriteFrames,
    getSpritesheet,
    RegisteredCanvasComponents,
    showAnimatedSprite,
} from "../src/canvas";
import type { AnimatedSpriteMemory } from "../src/canvas";

const SHEET_ALIAS = "test-animated-sheet";
const ASEPRITE_ALIAS = "test-animated-aseprite";

/** Frame names deliberately declared in lexical order, like the PixiJS `mc.json` example. */
const FRAME_NAMES = ["frame 1.png", "frame 10.png", "frame 2.png", "frame 3.png"];

function createSheetData(names: string[], duration?: number) {
    const frames: Record<string, any> = {};
    names.forEach((name, i) => {
        frames[name] = {
            frame: { x: i * 8, y: 0, w: 8, h: 8 },
            sourceSize: { w: 8, h: 8 },
            spriteSourceSize: { x: 0, y: 0, w: 8, h: 8 },
            ...(duration !== undefined ? { duration: duration * (i + 1) } : {}),
        };
    });
    return {
        frames,
        animations: { blink: ["frame 3.png", "frame 1.png"] },
        meta: { scale: 1 },
    };
}

async function registerSheet(alias: string, data: any) {
    const texture = new PIXI.Texture({
        source: new PIXI.TextureSource({ width: 64, height: 8, label: `${alias}.png` }),
    });
    const sheet = new PIXI.Spritesheet(texture, data);
    await sheet.parse();
    PIXI.Assets.cache.set(alias, sheet);
    return sheet;
}

let sheet: PIXI.Spritesheet;

beforeAll(async () => {
    sheet = await registerSheet(SHEET_ALIAS, createSheetData(FRAME_NAMES));
    await registerSheet(ASEPRITE_ALIAS, createSheetData(["a 0.ase", "a 1.ase", "a 2.ase"], 50));
});

afterEach(() => vi.restoreAllMocks());

describe("getSpritesheet", () => {
    test("returns a cached spritesheet", async () => {
        expect(await getSpritesheet(SHEET_ALIAS)).toBe(sheet);
    });

    test("throws when the asset is not a spritesheet", async () => {
        PIXI.Assets.cache.set("not-a-sheet", PIXI.Texture.WHITE);
        await expect(getSpritesheet("not-a-sheet")).rejects.toThrow(/not a Spritesheet/);
    });

    test("throws without alias", async () => {
        await expect(getSpritesheet(undefined)).rejects.toThrow();
    });
});

describe("getAnimatedSpriteFrames", () => {
    test("uses all frames in natural order when only the spritesheet is set", async () => {
        const frames = (await getAnimatedSpriteFrames({ spritesheet: SHEET_ALIAS })) as PIXI.Texture[];
        expect(frames).toEqual([
            sheet.textures["frame 1.png"],
            sheet.textures["frame 2.png"],
            sheet.textures["frame 3.png"],
            sheet.textures["frame 10.png"],
        ]);
    });

    test("uses a named animation", async () => {
        const frames = await getAnimatedSpriteFrames({ spritesheet: SHEET_ALIAS, animation: "blink" });
        expect(frames).toEqual([sheet.textures["frame 3.png"], sheet.textures["frame 1.png"]]);
    });

    test("uses the listed frames, with optional durations", async () => {
        const plain = await getAnimatedSpriteFrames({
            spritesheet: SHEET_ALIAS,
            frames: ["frame 2.png", "frame 1.png"],
        });
        expect(plain).toEqual([sheet.textures["frame 2.png"], sheet.textures["frame 1.png"]]);

        const timed = await getAnimatedSpriteFrames({
            spritesheet: SHEET_ALIAS,
            frames: [{ texture: "frame 2.png", time: 300 }, "frame 1.png"],
        });
        expect(timed).toEqual([
            { texture: sheet.textures["frame 2.png"], time: 300 },
            { texture: sheet.textures["frame 1.png"], time: DEFAULT_ANIMATED_SPRITE_FRAME_TIME },
        ]);
    });

    test("reads per-frame durations from the spritesheet JSON with useFrameDurations", async () => {
        const frames = (await getAnimatedSpriteFrames({
            spritesheet: ASEPRITE_ALIAS,
            useFrameDurations: true,
        })) as PIXI.FrameObject[];
        expect(frames.map((f) => f.time)).toEqual([50, 100, 150]);
    });

    test("falls back to the default duration when the JSON has none", async () => {
        const frames = (await getAnimatedSpriteFrames({
            spritesheet: SHEET_ALIAS,
            animation: "blink",
            useFrameDurations: true,
        })) as PIXI.FrameObject[];
        expect(frames.map((f) => f.time)).toEqual([
            DEFAULT_ANIMATED_SPRITE_FRAME_TIME,
            DEFAULT_ANIMATED_SPRITE_FRAME_TIME,
        ]);
    });

    test("uses texture aliases when there is no spritesheet", async () => {
        PIXI.Assets.cache.set("frame-a", PIXI.Texture.WHITE);
        PIXI.Assets.cache.set("frame-b", PIXI.Texture.EMPTY);
        const frames = await getAnimatedSpriteFrames({ frames: ["frame-a", "frame-b"] });
        expect(frames).toEqual([PIXI.Texture.WHITE, PIXI.Texture.EMPTY]);
    });

    test("throws for a missing animation, a missing frame, or an empty source", async () => {
        await expect(
            getAnimatedSpriteFrames({ spritesheet: SHEET_ALIAS, animation: "nope" }),
        ).rejects.toThrow(/animation nope/);
        await expect(
            getAnimatedSpriteFrames({ spritesheet: SHEET_ALIAS, frames: ["nope.png"] }),
        ).rejects.toThrow(/frame nope.png/);
        await expect(getAnimatedSpriteFrames({})).rejects.toThrow(/no frames/);
    });
});

describe("AnimatedSprite", () => {
    test("can be created without frames", () => {
        const sprite = new AnimatedSprite();
        expect(sprite.totalFrames).toBe(1);
        expect(sprite.haveEmptyTexture).toBe(true);
        expect(sprite.pixivnId).toBe("AnimatedSprite");
        expect(RegisteredCanvasComponents.has("AnimatedSprite")).toBe(true);
    });

    test("load() sets the frames and keeps the frame and playing state set before loading", async () => {
        const sprite = new AnimatedSprite({ autoUpdate: false }, { spritesheet: SHEET_ALIAS });
        sprite.setFrame(2, true);
        expect(sprite.haveEmptyTexture).toBe(true);
        await sprite.load();
        expect(sprite.totalFrames).toBe(4);
        expect(sprite.currentFrame).toBe(2);
        expect(sprite.playing).toBe(true);
        expect(sprite.texture).toBe(sheet.textures["frame 3.png"]);
    });

    test("load() reports an error and keeps the placeholder for an invalid source", async () => {
        const sprite = new AnimatedSprite(undefined, { spritesheet: SHEET_ALIAS, animation: "nope" });
        await sprite.load();
        expect(sprite.haveEmptyTexture).toBe(true);
        expect(sprite.loadIsStarted).toBe(false);
    });

    test("memory round trip keeps source, playback state and position", async () => {
        vi.spyOn(canvas, "screen", "get").mockReturnValue(new PIXI.Rectangle(0, 0, 800, 600));
        const sprite = new AnimatedSprite(
            {
                autoUpdate: false,
                animationSpeed: 0.25,
                loop: false,
                anchor: 0.5,
                align: { x: 0.25, y: 0.75 },
            },
            { spritesheet: SHEET_ALIAS, animation: "blink" },
        );
        await sprite.load();
        sprite.gotoAndStop(1);
        sprite.alpha = 0.5;

        const memory = JSON.parse(JSON.stringify(sprite.memory)) as AnimatedSpriteMemory;
        expect(memory.pixivnId).toBe("AnimatedSprite");
        expect(memory.source).toEqual({ spritesheet: SHEET_ALIAS, animation: "blink" });
        expect(memory.currentFrame).toBe(1);
        expect(memory.playing).toBe(false);
        expect(memory).not.toHaveProperty("textureData");

        const restored = (await RegisteredCanvasComponents.getInstance(
            "AnimatedSprite",
            memory,
        )) as AnimatedSprite;
        expect(restored).toBeInstanceOf(AnimatedSprite);
        expect(restored.source).toEqual(memory.source);
        expect(restored.totalFrames).toBe(2);
        expect(restored.currentFrame).toBe(1);
        expect(restored.texture).toBe(sheet.textures["frame 1.png"]);
        expect(restored.playing).toBe(false);
        expect(restored.animationSpeed).toBe(0.25);
        expect(restored.loop).toBe(false);
        expect(restored.alpha).toBe(0.5);
        expect(restored.anchor.x).toBe(0.5);
        expect(restored.positionType).toBe("align");
        expect(restored.memory.align).toEqual({ x: 0.25, y: 0.75 });
    });

    test("a restored playing animation is playing again", async () => {
        const sprite = new AnimatedSprite(
            { autoUpdate: false },
            { spritesheet: ASEPRITE_ALIAS, useFrameDurations: true },
        );
        await sprite.load();
        sprite.gotoAndPlay(2);
        const restored = new AnimatedSprite();
        await restored.setMemory(sprite.memory);
        expect(restored.playing).toBe(true);
        expect(restored.currentFrame).toBe(2);
        expect(restored.source?.useFrameDurations).toBe(true);
    });

    test("memory is a copy of the source", () => {
        const source = { spritesheet: SHEET_ALIAS, frames: ["frame 1.png"] };
        const sprite = new AnimatedSprite(undefined, source);
        const memory = sprite.memory;
        source.frames.push("frame 2.png");
        expect(memory.source?.frames).toEqual(["frame 1.png"]);
    });
});

describe("AnimatedSprite playback", () => {
    /** One 60fps frame: `deltaTime` 1 = 1000/60 ms. */
    const tick = (sprite: AnimatedSprite, ms: number) =>
        sprite.update({ deltaTime: (ms * 60) / 1000 } as PIXI.Ticker);

    test("frame durations from the spritesheet drive the frame changes", async () => {
        const sprite = new AnimatedSprite(
            { autoUpdate: false },
            { spritesheet: ASEPRITE_ALIAS, useFrameDurations: true },
        );
        await sprite.load();
        sprite.play();
        // durations: 50, 100, 150 ms
        tick(sprite, 40);
        expect(sprite.currentFrame).toBe(0);
        tick(sprite, 20);
        expect(sprite.currentFrame).toBe(1);
        tick(sprite, 100);
        expect(sprite.currentFrame).toBe(2);
    });

    test("animationSpeed is used when there are no durations", async () => {
        const sprite = new AnimatedSprite(
            { autoUpdate: false, animationSpeed: 0.5 },
            { spritesheet: SHEET_ALIAS },
        );
        await sprite.load();
        sprite.play();
        sprite.update({ deltaTime: 2 } as PIXI.Ticker);
        expect(sprite.currentFrame).toBe(1);
    });

    test("a frame set before load() out of range is clamped to the last frame", async () => {
        const sprite = new AnimatedSprite({ autoUpdate: false }, { spritesheet: SHEET_ALIAS });
        sprite.setFrame(99, false);
        await sprite.load();
        expect(sprite.currentFrame).toBe(3);
        expect(sprite.playing).toBe(false);
    });

    test("memory reports the pending frame before load()", () => {
        const sprite = new AnimatedSprite({ autoUpdate: false }, { spritesheet: SHEET_ALIAS });
        sprite.setFrame(2, false);
        expect(sprite.memory.currentFrame).toBe(2);
    });

    test("load() without a source does nothing", async () => {
        const sprite = new AnimatedSprite();
        await sprite.load();
        expect(sprite.haveEmptyTexture).toBe(true);
    });

    test("can be created from a Texture[] like PIXI.AnimatedSprite", () => {
        const sprite = new AnimatedSprite([PIXI.Texture.WHITE, PIXI.Texture.EMPTY]);
        expect(sprite.totalFrames).toBe(2);
        expect(sprite.source).toBeUndefined();
    });

    test("copyProperty copies playback settings but not the source", async () => {
        const sprite = new AnimatedSprite(
            { autoUpdate: false },
            { spritesheet: SHEET_ALIAS, animation: "blink" },
        );
        await RegisteredCanvasComponents.copyProperty("AnimatedSprite", sprite, {
            pixivnId: "AnimatedSprite",
            source: { spritesheet: ASEPRITE_ALIAS },
            animationSpeed: 2,
            loop: false,
            alpha: 0.4,
        } as AnimatedSpriteMemory);
        expect(sprite.source).toEqual({ spritesheet: SHEET_ALIAS, animation: "blink" });
        expect(sprite.animationSpeed).toBe(2);
        expect(sprite.loop).toBe(false);
        expect(sprite.alpha).toBe(0.4);
        expect(sprite.haveEmptyTexture).toBe(true);
    });
});

describe("addAnimatedSprite / showAnimatedSprite", () => {
    function mockCanvas(oldMemory?: AnimatedSpriteMemory) {
        const add = vi.spyOn(canvas, "add").mockImplementation(() => {});
        vi.spyOn(canvas, "find").mockReturnValue(
            oldMemory ? ({ memory: oldMemory } as any) : undefined,
        );
        const copy = vi
            .spyOn(canvas, "copyCanvasElementProperty")
            .mockImplementation(async (memory, component) => {
                await RegisteredCanvasComponents.copyProperty(
                    "AnimatedSprite",
                    component as any,
                    memory as any,
                );
            });
        return { add, copy };
    }

    test("addAnimatedSprite adds the component without loading it", () => {
        const { add } = mockCanvas();
        const sprite = addAnimatedSprite("fighter", SHEET_ALIAS, { loop: false });
        expect(sprite.source).toEqual({ spritesheet: SHEET_ALIAS });
        expect(sprite.haveEmptyTexture).toBe(true);
        expect(sprite.loop).toBe(false);
        expect(add).toHaveBeenCalledWith("fighter", sprite, { ignoreOldStyle: true, zIndex: undefined });
    });

    test("uses the alias as spritesheet when no source is passed", () => {
        mockCanvas();
        vi.spyOn(PIXI.Assets.resolver, "hasKey").mockReturnValue(true);
        const sprite = addAnimatedSprite(SHEET_ALIAS);
        expect(sprite.source).toEqual({ spritesheet: SHEET_ALIAS });
    });

    test("throws when no source is passed and the alias is not registered", () => {
        mockCanvas();
        vi.spyOn(PIXI.Assets.resolver, "hasKey").mockReturnValue(false);
        expect(() => addAnimatedSprite("unknown")).toThrow(/does not exist/);
    });

    test("showAnimatedSprite loads the frames and plays by default", async () => {
        const { add } = mockCanvas();
        const sprite = await showAnimatedSprite("blink", {
            spritesheet: SHEET_ALIAS,
            animation: "blink",
        });
        expect(sprite.totalFrames).toBe(2);
        expect(sprite.playing).toBe(true);
        expect(sprite.label).toBe("blink");
        expect(add).toHaveBeenCalledOnce();
        sprite.stop();
    });

    test("showAnimatedSprite keeps the properties of the replaced component, but not its source", async () => {
        const old = new AnimatedSprite({ autoUpdate: false }, { spritesheet: SHEET_ALIAS });
        old.alpha = 0.3;
        old.x = 42;
        mockCanvas(old.memory);
        const sprite = await showAnimatedSprite(
            "swap",
            { spritesheet: SHEET_ALIAS, animation: "blink" },
            { autoPlay: false },
        );
        await vi.waitFor(() => expect(sprite.alpha).toBe(0.3));
        expect(sprite.x).toBe(42);
        expect(sprite.source).toEqual({ spritesheet: SHEET_ALIAS, animation: "blink" });
        expect(sprite.totalFrames).toBe(2);
    });
});
