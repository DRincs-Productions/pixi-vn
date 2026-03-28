import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { sound } from "../src";
import AudioChannel from "../src/sound/classes/AudioChannel";
import SoundManagerStatic from "../src/sound/SoundManagerStatic";
import { SoundPlayOptions } from "../src/sound/interfaces/SoundOptions";
import IMediaInstance from "../src/sound/interfaces/IMediaInstance";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _idCounter = 0;

/** Creates a minimal fake IMediaInstance that satisfies what SoundManager needs. */
function makeFakeMediaInstance() {
    let _paused = false;
    const listeners: Record<string, Array<() => void>> = {};
    const inst = {
        id: ++_idCounter,
        get paused() {
            return _paused;
        },
        set paused(v: boolean) {
            _paused = v;
        },
        volume: 1,
        muted: false,
        loop: false,
        stop: vi.fn(),
        on: vi.fn((event: string, cb: () => void) => {
            if (!listeners[event]) listeners[event] = [];
            listeners[event].push(cb);
        }),
        emit(event: string) {
            listeners[event]?.forEach((cb) => cb());
        },
    } as unknown as IMediaInstance & { emit(e: string): void };
    return inst;
}

/**
 * Spy on AudioChannel.prototype.play so tests exercise SoundManager's routing
 * logic without requiring a real audio context.  The spy correctly populates
 * SoundManagerStatic.mediaInstances so that export/restore helpers still work.
 */
function stubChannelPlay() {
    return vi
        .spyOn(AudioChannel.prototype as any, "play")
        .mockImplementation(async function (
            this: AudioChannel,
            aliasOrMediaAlias: string,
            soundAliasOrOptions?: string | SoundPlayOptions,
            options?: SoundPlayOptions,
        ): Promise<IMediaInstance> {
            let mediaAlias: string;
            let soundAlias: string;
            if (typeof soundAliasOrOptions === "string") {
                mediaAlias = aliasOrMediaAlias;
                soundAlias = soundAliasOrOptions;
            } else {
                mediaAlias = aliasOrMediaAlias;
                soundAlias = aliasOrMediaAlias;
                options = soundAliasOrOptions;
            }
            const inst = makeFakeMediaInstance();
            SoundManagerStatic.mediaInstances[mediaAlias] = {
                channelAlias: this.alias,
                soundAlias,
                instance: inst,
                stepCounter: 0,
                options: {
                    volume: options?.volume ?? 1,
                    muted: options?.muted ?? false,
                    loop: options?.loop ?? false,
                },
            };
            inst.on("end", () => {
                delete SoundManagerStatic.mediaInstances[mediaAlias];
            });
            return inst;
        });
}

/** Reset all sound-related state between tests. */
function clearSound() {
    SoundManagerStatic.mediaInstances = {};
    SoundManagerStatic.channels = {};
    sound.defaultChannelAlias = "general";
}

// ---------------------------------------------------------------------------
// Tests: export format
// ---------------------------------------------------------------------------

describe("sound export format", () => {
    beforeEach(() => clearSound());

    test("export() returns { mediaInstances, filters } format", () => {
        const exported = sound.export();
        expect(exported).toHaveProperty("mediaInstances");
        expect(exported).toHaveProperty("filters");
        expect(exported).not.toHaveProperty("soundsPlaying");
        expect(exported).not.toHaveProperty("soundAliasesOrder");
    });

    test("export() returns empty mediaInstances when nothing is playing", () => {
        const exported = sound.export();
        expect(exported.mediaInstances).toEqual({});
        expect(exported.filters).toEqual([]);
    });

    test("export() uses mediaAlias (not soundAlias) as the map key", () => {
        // Directly insert a fake entry where mediaAlias ≠ soundAlias
        SoundManagerStatic.mediaInstances["the-media-alias"] = {
            channelAlias: "general",
            soundAlias: "the-sound-alias",
            instance: makeFakeMediaInstance(),
            stepCounter: 1,
            options: { volume: 1, muted: false, loop: false },
        };

        const exported = sound.export();
        expect(exported.mediaInstances).toHaveProperty("the-media-alias");
        expect(exported.mediaInstances).not.toHaveProperty("the-sound-alias");
        expect(exported.mediaInstances["the-media-alias"].soundAlias).toBe("the-sound-alias");
    });

    test("two media aliases pointing to the same soundAlias both appear in export()", () => {
        SoundManagerStatic.mediaInstances["media1"] = {
            channelAlias: "general",
            soundAlias: "shared-sound",
            instance: makeFakeMediaInstance(),
            stepCounter: 1,
            options: { volume: 1, muted: false, loop: false },
        };
        SoundManagerStatic.mediaInstances["media2"] = {
            channelAlias: "general",
            soundAlias: "shared-sound",
            instance: makeFakeMediaInstance(),
            stepCounter: 1,
            options: { volume: 0.5, muted: false, loop: false },
        };

        const exported = sound.export();
        expect(exported.mediaInstances).toHaveProperty("media1");
        expect(exported.mediaInstances).toHaveProperty("media2");
        expect(exported.mediaInstances["media1"].soundAlias).toBe("shared-sound");
        expect(exported.mediaInstances["media2"].soundAlias).toBe("shared-sound");
    });

    test("export() preserves the per-instance stepCounter (not a global value)", () => {
        SoundManagerStatic.mediaInstances["early"] = {
            channelAlias: "general",
            soundAlias: "s1",
            instance: makeFakeMediaInstance(),
            stepCounter: 3,
            options: { volume: 1, muted: false, loop: false },
        };
        SoundManagerStatic.mediaInstances["late"] = {
            channelAlias: "general",
            soundAlias: "s2",
            instance: makeFakeMediaInstance(),
            stepCounter: 7,
            options: { volume: 1, muted: false, loop: false },
        };

        const exported = sound.export();
        expect(exported.mediaInstances["early"].stepCounter).toBe(3);
        expect(exported.mediaInstances["late"].stepCounter).toBe(7);
    });

    test("export() records paused state as true when sound is paused", () => {
        const inst = makeFakeMediaInstance();
        SoundManagerStatic.mediaInstances["pausable"] = {
            channelAlias: "general",
            soundAlias: "s",
            instance: inst,
            stepCounter: 1,
            options: { volume: 1, muted: false, loop: false },
        };
        inst.paused = true;

        const exported = sound.export();
        expect(exported.mediaInstances["pausable"].paused).toBe(true);
    });

    test("export() records paused state as false when sound is playing", () => {
        const inst = makeFakeMediaInstance();
        SoundManagerStatic.mediaInstances["playing"] = {
            channelAlias: "general",
            soundAlias: "s",
            instance: inst,
            stepCounter: 1,
            options: { volume: 1, muted: false, loop: false },
        };

        const exported = sound.export();
        expect(exported.mediaInstances["playing"].paused).toBe(false);
    });

    test("export() includes the channelAlias for each media instance", () => {
        sound.addChannel("bgm");
        SoundManagerStatic.mediaInstances["bgm-track"] = {
            channelAlias: "bgm",
            soundAlias: "music",
            instance: makeFakeMediaInstance(),
            stepCounter: 1,
            options: { volume: 1, muted: false, loop: true },
        };

        const exported = sound.export();
        expect(exported.mediaInstances["bgm-track"].channelAlias).toBe("bgm");
    });
});

// ---------------------------------------------------------------------------
// Tests: channels
// ---------------------------------------------------------------------------

describe("sound channels", () => {
    beforeEach(() => clearSound());

    test("addChannel creates a channel with the given alias", () => {
        const channel = sound.addChannel("music");
        expect(channel).toBeDefined();
        expect(channel!.alias).toBe("music");
    });

    test("addChannel with array creates multiple independent channels", () => {
        sound.addChannel(["bgm", "sfx"]);
        expect(sound.findChannel("bgm").alias).toBe("bgm");
        expect(sound.findChannel("sfx").alias).toBe("sfx");
    });

    test("findChannel returns the same existing channel instance", () => {
        sound.addChannel("music");
        expect(sound.findChannel("music")).toBe(sound.findChannel("music"));
    });

    test("findChannel auto-creates a channel if it does not exist", () => {
        const ch = sound.findChannel("new-channel");
        expect(ch).toBeDefined();
        expect(ch.alias).toBe("new-channel");
    });

    test("addChannel returns undefined when alias already exists", () => {
        sound.addChannel("music");
        expect(sound.addChannel("music")).toBeUndefined();
    });

    test("channels getter returns all registered channels", () => {
        sound.addChannel(["ch1", "ch2", "ch3"]);
        const aliases = sound.channels.map((c) => c.alias);
        expect(aliases).toContain("ch1");
        expect(aliases).toContain("ch2");
        expect(aliases).toContain("ch3");
    });

    test("channel volume defaults to 1", () => {
        expect(sound.addChannel("music")!.volume).toBe(1);
    });

    test("channel volume can be set to 0", () => {
        const ch = sound.addChannel("music")!;
        ch.volume = 0;
        expect(ch.volume).toBe(0);
    });

    test("channel muted defaults to false", () => {
        expect(sound.addChannel("music")!.muted).toBe(false);
    });

    test("background channel property reflects the options passed to addChannel", () => {
        expect(sound.addChannel("bgm", { background: true })!.background).toBe(true);
        expect(sound.addChannel("sfx", { background: false })!.background).toBe(false);
    });

    test("addChannel with array does not share the options object between channels", () => {
        sound.addChannel(["a", "b"], { volume: 0.5 });
        const chA = sound.findChannel("a");
        const chB = sound.findChannel("b");
        chA.volume = 0.8;
        // Mutating chA must not affect chB
        expect(chB.volume).toBe(0.5);
    });
});

// ---------------------------------------------------------------------------
// Tests: play routing and media instance tracking
// ---------------------------------------------------------------------------

describe("sound play routing and mediaInstances tracking", () => {
    let playSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        clearSound();
        playSpy = stubChannelPlay();
    });

    afterEach(() => {
        playSpy.mockRestore();
    });

    test("play() registers media instance keyed by mediaAlias", async () => {
        await sound.play("my-media");
        expect(SoundManagerStatic.mediaInstances["my-media"]).toBeDefined();
    });

    test("play() with separate mediaAlias and soundAlias stores the correct soundAlias", async () => {
        await sound.play("media-alias", "sound-asset");
        expect(SoundManagerStatic.mediaInstances["media-alias"]?.soundAlias).toBe("sound-asset");
    });

    test("stop() removes the media instance from tracking", async () => {
        await sound.play("stopper");
        expect(SoundManagerStatic.mediaInstances["stopper"]).toBeDefined();
        sound.stop("stopper");
        expect(SoundManagerStatic.mediaInstances["stopper"]).toBeUndefined();
    });

    test("clear() removes all tracked media instances", async () => {
        await sound.play("s1");
        await sound.play("s2");
        sound.clear();
        expect(Object.keys(SoundManagerStatic.mediaInstances)).toHaveLength(0);
    });

    test("play() without channel option uses the general channel by default", async () => {
        await sound.play("my-sound");
        expect(SoundManagerStatic.mediaInstances["my-sound"]?.channelAlias).toBe("general");
    });

    test("play() with explicit channel option routes to the specified channel", async () => {
        sound.addChannel("bgm");
        await sound.play("my-sound", { channel: "bgm" });
        expect(SoundManagerStatic.mediaInstances["my-sound"]?.channelAlias).toBe("bgm");
    });

    test("changing defaultChannelAlias routes subsequent play() calls to the new default", async () => {
        sound.addChannel("custom-default");
        sound.defaultChannelAlias = "custom-default";
        await sound.play("my-sound");
        expect(SoundManagerStatic.mediaInstances["my-sound"]?.channelAlias).toBe("custom-default");
    });

    test("explicit channel option always overrides defaultChannelAlias", async () => {
        sound.addChannel("explicit-channel");
        sound.defaultChannelAlias = "other-default";
        await sound.play("my-sound", { channel: "explicit-channel" });
        expect(SoundManagerStatic.mediaInstances["my-sound"]?.channelAlias).toBe("explicit-channel");
    });
});

// ---------------------------------------------------------------------------
// Tests: restore
// ---------------------------------------------------------------------------

describe("sound restore", () => {
    beforeEach(() => clearSound());

    test("restore() with empty mediaInstances leaves no active media", async () => {
        await sound.restore({ mediaInstances: {}, filters: [] });
        expect(Object.keys(SoundManagerStatic.mediaInstances)).toHaveLength(0);
    });

    test("restore() with legacy soundsPlaying does not throw", async () => {
        await expect(sound.restore({ soundsPlaying: {}, filters: [] })).resolves.not.toThrow();
    });
});

// ---------------------------------------------------------------------------
// Tests: defaultChannelAlias
// ---------------------------------------------------------------------------

describe("defaultChannelAlias", () => {
    beforeEach(() => clearSound());

    test("defaultChannelAlias is 'general' by default", () => {
        expect(sound.defaultChannelAlias).toBe("general");
    });

    test("defaultChannelAlias can be changed", () => {
        sound.defaultChannelAlias = "bgm";
        expect(sound.defaultChannelAlias).toBe("bgm");
    });
});
