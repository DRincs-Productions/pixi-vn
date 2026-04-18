import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { sound, SoundGameState } from "../src";
import AudioChannel from "../src/sound/classes/AudioChannel";
import IMediaInstance from "../src/sound/interfaces/IMediaInstance";
import { SoundPlayOptions } from "../src/sound/interfaces/SoundOptions";
import SoundManagerStatic from "../src/sound/SoundManagerStatic";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _idCounter = 0;

/** Minimal test double for IMediaInstance, extended with a test-only emit helper. */
interface FakeMediaInstance extends IMediaInstance {
    emit(event: string): void;
    filters?: any[];
}

/** Creates a minimal fake IMediaInstance that satisfies what SoundManager needs. */
function makeFakeMediaInstance(): FakeMediaInstance {
    let _paused = false;
    const listeners: Record<string, Array<() => void>> = {};
    return {
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
        speed: 1,
        filters: [],
        stop: vi.fn(),
        on: vi.fn((event: string, cb: () => void) => {
            if (!listeners[event]) listeners[event] = [];
            listeners[event].push(cb);
        }) as unknown as IMediaInstance["on"],
        emit(event: string) {
            listeners[event]?.forEach((cb) => cb());
        },
    } as FakeMediaInstance;
}

/**
 * Spy on AudioChannel.prototype.play so tests exercise SoundManager's routing
 * logic without requiring a real audio context.  The spy correctly populates
 * SoundManagerStatic.mediaInstances so that export/restore helpers still work.
 */
function stubChannelPlay() {
    return vi.spyOn(AudioChannel.prototype as any, "play").mockImplementation(async function (
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
        SoundManagerStatic.mediaInstances.set(mediaAlias, {
            channelAlias: this.alias,
            soundAlias,
            instance: inst,
            stepCounter: 0,
            options: {
                volume: options?.volume ?? 1,
                muted: options?.muted ?? false,
                loop: options?.loop ?? false,
            },
        });
        inst.on("end", () => {
            SoundManagerStatic.mediaInstances.delete(mediaAlias);
        });
        return inst;
    });
}

/** Reset all sound-related state between tests. */
function clearSound() {
    SoundManagerStatic.mediaInstances.clear();
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
        SoundManagerStatic.mediaInstances.set("the-media-alias", {
            channelAlias: "general",
            soundAlias: "the-sound-alias",
            instance: makeFakeMediaInstance(),
            stepCounter: 1,
            options: { volume: 1, muted: false, loop: false },
        });

        const exported = sound.export();
        expect(exported.mediaInstances).toHaveProperty("the-media-alias");
        expect(exported.mediaInstances).not.toHaveProperty("the-sound-alias");
        expect(exported.mediaInstances["the-media-alias"].soundAlias).toBe("the-sound-alias");
    });

    test("two media aliases pointing to the same soundAlias both appear in export()", () => {
        SoundManagerStatic.mediaInstances.set("media1", {
            channelAlias: "general",
            soundAlias: "shared-sound",
            instance: makeFakeMediaInstance(),
            stepCounter: 1,
            options: { volume: 1, muted: false, loop: false },
        });
        SoundManagerStatic.mediaInstances.set("media2", {
            channelAlias: "general",
            soundAlias: "shared-sound",
            instance: makeFakeMediaInstance(),
            stepCounter: 1,
            options: { volume: 0.5, muted: false, loop: false },
        });

        const exported = sound.export();
        expect(exported.mediaInstances).toHaveProperty("media1");
        expect(exported.mediaInstances).toHaveProperty("media2");
        expect(exported.mediaInstances["media1"].soundAlias).toBe("shared-sound");
        expect(exported.mediaInstances["media2"].soundAlias).toBe("shared-sound");
    });

    test("export() preserves the per-instance stepCounter (not a global value)", () => {
        SoundManagerStatic.mediaInstances.set("early", {
            channelAlias: "general",
            soundAlias: "s1",
            instance: makeFakeMediaInstance(),
            stepCounter: 3,
            options: { volume: 1, muted: false, loop: false },
        });
        SoundManagerStatic.mediaInstances.set("late", {
            channelAlias: "general",
            soundAlias: "s2",
            instance: makeFakeMediaInstance(),
            stepCounter: 7,
            options: { volume: 1, muted: false, loop: false },
        });

        const exported = sound.export();
        expect(exported.mediaInstances["early"].stepCounter).toBe(3);
        expect(exported.mediaInstances["late"].stepCounter).toBe(7);
    });

    test("export() records paused state as true when sound is paused", () => {
        const inst = makeFakeMediaInstance();
        SoundManagerStatic.mediaInstances.set("pausable", {
            channelAlias: "general",
            soundAlias: "s",
            instance: inst,
            stepCounter: 1,
            options: { volume: 1, muted: false, loop: false },
        });
        inst.paused = true;

        const exported = sound.export();
        expect(exported.mediaInstances["pausable"].paused).toBe(true);
    });

    test("export() records paused state as false when sound is playing", () => {
        const inst = makeFakeMediaInstance();
        SoundManagerStatic.mediaInstances.set("playing", {
            channelAlias: "general",
            soundAlias: "s",
            instance: inst,
            stepCounter: 1,
            options: { volume: 1, muted: false, loop: false },
        });

        const exported = sound.export();
        expect(exported.mediaInstances["playing"].paused).toBe(false);
    });

    test("export() includes the channelAlias for each media instance", () => {
        sound.addChannel("bgm");
        SoundManagerStatic.mediaInstances.set("bgm-track", {
            channelAlias: "bgm",
            soundAlias: "music",
            instance: makeFakeMediaInstance(),
            stepCounter: 1,
            options: { volume: 1, muted: false, loop: true },
        });

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
        expect(SoundManagerStatic.mediaInstances.get("my-media")).toBeDefined();
    });

    test("play() with separate mediaAlias and soundAlias stores the correct soundAlias", async () => {
        await sound.play("media-alias", "sound-asset");
        expect(SoundManagerStatic.mediaInstances.get("media-alias")?.soundAlias).toBe("sound-asset");
    });

    test("stop() removes the media instance from tracking", async () => {
        await sound.play("stopper");
        expect(SoundManagerStatic.mediaInstances.get("stopper")).toBeDefined();
        sound.stop("stopper");
        expect(SoundManagerStatic.mediaInstances.get("stopper")).toBeUndefined();
    });

    test("clear() removes all tracked media instances", async () => {
        await sound.play("s1");
        await sound.play("s2");
        sound.clear();
        expect(Array.from(SoundManagerStatic.mediaInstances.keys())).toHaveLength(0);
    });

    test("play() without channel option uses the general channel by default", async () => {
        await sound.play("my-sound");
        expect(SoundManagerStatic.mediaInstances.get("my-sound")?.channelAlias).toBe("general");
    });

    test("play() with explicit channel option routes to the specified channel", async () => {
        sound.addChannel("bgm");
        await sound.play("my-sound", { channel: "bgm" });
        expect(SoundManagerStatic.mediaInstances.get("my-sound")?.channelAlias).toBe("bgm");
    });

    test("changing defaultChannelAlias routes subsequent play() calls to the new default", async () => {
        sound.addChannel("custom-default");
        sound.defaultChannelAlias = "custom-default";
        await sound.play("my-sound");
        expect(SoundManagerStatic.mediaInstances.get("my-sound")?.channelAlias).toBe("custom-default");
    });

    test("explicit channel option always overrides defaultChannelAlias", async () => {
        sound.addChannel("explicit-channel");
        sound.defaultChannelAlias = "other-default";
        await sound.play("my-sound", { channel: "explicit-channel" });
        expect(SoundManagerStatic.mediaInstances.get("my-sound")?.channelAlias).toBe(
            "explicit-channel",
        );
    });
});

// ---------------------------------------------------------------------------
// Tests: restore
// ---------------------------------------------------------------------------

describe("sound restore", () => {
    beforeEach(() => clearSound());

    test("restore() with empty mediaInstances leaves no active media", async () => {
        await sound.restore({ mediaInstances: {}, filters: [] });
        expect(Array.from(SoundManagerStatic.mediaInstances.keys())).toHaveLength(0);
    });

    test("restore() with legacy soundsPlaying does not throw", async () => {
        await expect(sound.restore({ soundsPlaying: {}, filters: [] })).resolves.not.toThrow();
    });
});

// ---------------------------------------------------------------------------
// Tests: background channel settings restoration (goBack)
// ---------------------------------------------------------------------------

describe("background channel settings restoration", () => {
    let loadSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        clearSound();
        loadSpy = vi.spyOn(sound as any, "load").mockResolvedValue(undefined);
    });

    afterEach(() => {
        loadSpy.mockRestore();
    });

    /**
     * For background channels where the media is already playing (stepCounter ≠ current step),
     * restore() must update the instance's settings instead of replaying it.
     */
    function makeBackgroundState(opts: {
        paused?: boolean;
        loop?: boolean;
        volume?: number;
        muted?: boolean;
        speed?: number;
        filters?: any[];
        delay?: number;
        end?: number;
        singleInstance?: boolean;
        start?: number;
        stepCounter?: number;
    }): SoundGameState {
        return {
            mediaInstances: {
                "bg-music": {
                    channelAlias: "bgm",
                    soundAlias: "bg-music",
                    stepCounter: opts.stepCounter ?? 99,
                    paused: opts.paused ?? false,
                    options: {
                        loop: opts.loop ?? false,
                        volume: opts.volume ?? 1,
                        muted: opts.muted ?? false,
                        speed: opts.speed ?? 1,
                        ...(opts.filters !== undefined && { filters: opts.filters }),
                        ...(opts.delay !== undefined && { delay: opts.delay }),
                        ...(opts.end !== undefined && { end: opts.end }),
                        ...(opts.singleInstance !== undefined && {
                            singleInstance: opts.singleInstance,
                        }),
                        ...(opts.start !== undefined && { start: opts.start }),
                    },
                },
            },
            filters: [],
        };
    }

    test("restore() updates loop on a running background instance", async () => {
        sound.addChannel("bgm", { background: true });
        const inst = makeFakeMediaInstance();
        inst.loop = false;
        SoundManagerStatic.mediaInstances.set("bg-music", {
            channelAlias: "bgm",
            soundAlias: "bg-music",
            instance: inst,
            stepCounter: 0,
            options: { loop: false, volume: 1, muted: false, speed: 1 },
        });

        // stepCounter=99 in state differs from GameUnifier.stepCounter (0), so falls into the else branch
        await sound.restore(makeBackgroundState({ loop: true }));

        expect(inst.loop).toBe(true);
    });

    test("restore() updates volume on a running background instance", async () => {
        sound.addChannel("bgm", { background: true });
        const inst = makeFakeMediaInstance();
        inst.volume = 1;
        SoundManagerStatic.mediaInstances.set("bg-music", {
            channelAlias: "bgm",
            soundAlias: "bg-music",
            instance: inst,
            stepCounter: 0,
            options: { loop: false, volume: 1, muted: false, speed: 1 },
        });

        await sound.restore(makeBackgroundState({ volume: 0.5 }));

        expect(inst.volume).toBe(0.5);
    });

    test("restore() updates muted on a running background instance", async () => {
        sound.addChannel("bgm", { background: true });
        const inst = makeFakeMediaInstance();
        inst.muted = false;
        SoundManagerStatic.mediaInstances.set("bg-music", {
            channelAlias: "bgm",
            soundAlias: "bg-music",
            instance: inst,
            stepCounter: 0,
            options: { loop: false, volume: 1, muted: false, speed: 1 },
        });

        await sound.restore(makeBackgroundState({ muted: true }));

        expect(inst.muted).toBe(true);
    });

    test("restore() updates speed on a running background instance", async () => {
        sound.addChannel("bgm", { background: true });
        const inst = makeFakeMediaInstance();
        inst.speed = 1;
        SoundManagerStatic.mediaInstances.set("bg-music", {
            channelAlias: "bgm",
            soundAlias: "bg-music",
            instance: inst,
            stepCounter: 0,
            options: { loop: false, volume: 1, muted: false, speed: 1 },
        });

        await sound.restore(makeBackgroundState({ speed: 0.75 }));

        expect(inst.speed).toBe(0.75);
    });

    test("restore() updates paused on a running background instance", async () => {
        sound.addChannel("bgm", { background: true });
        const inst = makeFakeMediaInstance();
        SoundManagerStatic.mediaInstances.set("bg-music", {
            channelAlias: "bgm",
            soundAlias: "bg-music",
            instance: inst,
            stepCounter: 0,
            options: { loop: false, volume: 1, muted: false, speed: 1 },
        });

        await sound.restore(makeBackgroundState({ paused: true }));

        expect(inst.paused).toBe(true);
    });

    test("restore() does not change settings when they already match", async () => {
        sound.addChannel("bgm", { background: true });
        const inst = makeFakeMediaInstance();
        inst.loop = true;
        inst.volume = 0.5;
        inst.muted = false;
        SoundManagerStatic.mediaInstances.set("bg-music", {
            channelAlias: "bgm",
            soundAlias: "bg-music",
            instance: inst,
            stepCounter: 0,
            options: { loop: true, volume: 0.5, muted: false, speed: 1 },
        });

        await sound.restore(makeBackgroundState({ loop: true, volume: 0.5, muted: false }));

        // No changes expected
        expect(inst.loop).toBe(true);
        expect(inst.volume).toBe(0.5);
        expect(inst.muted).toBe(false);
    });

    test("restore() updates filters on a running background instance", async () => {
        sound.addChannel("bgm", { background: true });
        const inst = makeFakeMediaInstance();
        SoundManagerStatic.mediaInstances.set("bg-music", {
            channelAlias: "bgm",
            soundAlias: "bg-music",
            instance: inst,
            stepCounter: 0,
            options: { loop: false, volume: 1, muted: false, speed: 1 },
        });

        await sound.restore(makeBackgroundState({ filters: [] }));

        // Filters are applied to the instance (even if empty array)
        expect(inst.filters).toBeDefined();
    });

    test("restore() syncs delay, end, singleInstance, start into stored options", async () => {
        sound.addChannel("bgm", { background: true });
        const inst = makeFakeMediaInstance();
        SoundManagerStatic.mediaInstances.set("bg-music", {
            channelAlias: "bgm",
            soundAlias: "bg-music",
            instance: inst,
            stepCounter: 0,
            options: { loop: false, volume: 1, muted: false, speed: 1 },
        });

        await sound.restore(
            makeBackgroundState({ delay: 2, end: 10, singleInstance: true, start: 1 }),
        );

        const storedOptions = SoundManagerStatic.mediaInstances.get("bg-music")?.options;
        expect(storedOptions.delay).toBe(2);
        expect(storedOptions.end).toBe(10);
        expect(storedOptions.singleInstance).toBe(true);
        expect(storedOptions.start).toBe(1);
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
