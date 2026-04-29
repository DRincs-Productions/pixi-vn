import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Stub Tone.js so tests never attempt real audio/network I/O.
vi.mock("tone", () => {
    const destStub = { volume: { value: 0 }, mute: false };
    return {
        ToneAudioBuffer: class {
            duration = 0;
            constructor(_url?: string, onload?: () => void) {
                if (onload) setTimeout(onload, 0);
            }
            static load(_url: string) {
                return Promise.resolve({});
            }
        },
        /**
         * Stub for Tone.Channel.
         *
         * AudioChannel holds a `toneChannel` property of this type.  The stub
         * exposes `volume` and `pan` as `{ value: number }` objects (matching
         * Tone's Param shape), `mute` as a boolean, and `toDestination` /
         * `connect` / `dispose` as no-op methods.
         */
        Channel: class {
            volume = { value: 0 };
            pan = { value: 0 };
            mute = false;
            get muted() {
                return this.mute;
            }
            constructor(_opts?: unknown) {}
            toDestination() {
                return this;
            }
            connect(_node: unknown) {
                return this;
            }
            disconnect() {
                return this;
            }
            dispose() {
                return this;
            }
        },
        Player: class {
            volume = { value: 0 };
            mute = false;
            loop = false;
            playbackRate = 1;
            onstop: (() => void) | null = null;
            constructor(_url?: unknown) {}
            toDestination() {
                return this;
            }
            connect(_node: unknown) {
                return this;
            }
            start = vi.fn();
            stop = vi.fn(function (this: { onstop: (() => void) | null }) {
                if (typeof this.onstop === "function") this.onstop();
            });
        },
        getContext: () => ({ rawContext: {} }),
        getDestination: () => destStub,
        loaded: () => Promise.resolve(),
        now: () => 0,
    };
});

import { sound, type SoundGameState } from "../src";
import AudioChannel from "../src/sound/classes/AudioChannel";
import type MediaInterface from "../src/sound/interfaces/MediaInterface";
import type { SoundPlayOptions } from "../src/sound/interfaces/SoundOptions";
import SoundRegistry from "../src/sound/SoundRegistry";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _idCounter = 0;

/**
 * Minimal test double for MediaInterface, extended with test-only helpers and
 * the extra properties that SoundManager reads when exporting/restoring state.
 */
interface FakeMediaInstance extends MediaInterface {
    emit(event: string): void;
    channelAlias: string;
    soundAlias: string;
    stepCounter: number;
    delay?: number;
    filters: any[];
    /** Readable/writable mirror of internal state used by SoundManager.export(). */
    memory: any;
    mute: boolean;
    playbackRate: number;
}

/**
 * Creates a fake MediaInterface that satisfies what SoundManager needs for
 * export, restore, stop, and channel-routing tests.
 */
function makeFakeMediaInstance(opts: {
    channelAlias?: string;
    soundAlias?: string;
    stepCounter?: number;
    paused?: boolean;
    loop?: boolean;
    volume?: number;
    muted?: boolean;
    speed?: number;
} = {}): FakeMediaInstance {
    let _paused = opts.paused ?? false;
    let _loop = opts.loop ?? false;
    let _volume = opts.volume ?? 1;
    let _muted = opts.muted ?? false;
    let _speed = opts.speed ?? 1;
    const listeners: Record<string, Array<() => void>> = {};
    const fake: any = {
        id: ++_idCounter,
        channelAlias: opts.channelAlias ?? "general",
        soundAlias: opts.soundAlias ?? "",
        stepCounter: opts.stepCounter ?? 0,
        delay: undefined as number | undefined,
        filters: [] as any[],
        get paused() { return _paused; },
        set paused(v: boolean) { _paused = v; },
        get loop() { return _loop; },
        set loop(v: boolean) { _loop = v; },
        get volume() { return _volume; },
        set volume(v: number) { _volume = v; },
        get muted() { return _muted; },
        set muted(v: boolean) { _muted = v; },
        /** Tone.js name for muted */
        get mute() { return _muted; },
        set mute(v: boolean) { _muted = v; },
        get speed() { return _speed; },
        set speed(v: number) { _speed = v; },
        /** Tone.js name for speed */
        get playbackRate() { return _speed; },
        set playbackRate(v: number) { _speed = v; },
        get memory() {
            return {
                loop: _loop,
                volume: _volume,
                mute: _muted,
                playbackRate: _speed,
                paused: _paused,
                elapsed: undefined,
            };
        },
        set memory(m: any) {
            if (m.paused !== undefined) _paused = m.paused;
            if (m.loop !== undefined) _loop = m.loop;
            if (m.volume !== undefined) _volume = m.volume;
            if (m.mute !== undefined) _muted = m.mute;
            if (m.playbackRate !== undefined) _speed = m.playbackRate;
        },
        stop: vi.fn(),
        chain: vi.fn(function() { return fake; }),
        disconnect: vi.fn(function() { return fake; }),
        on: vi.fn((event: string, cb: () => void) => {
            if (!listeners[event]) listeners[event] = [];
            listeners[event].push(cb);
        }) as unknown as MediaInterface["on"],
        emit(event: string) {
            listeners[event]?.forEach((cb) => cb());
        },
    };
    return fake as unknown as FakeMediaInstance;
}

/**
 * Spy on AudioChannel.prototype.play so tests exercise SoundManager's routing
 * logic without requiring a real audio context.  The spy populates
 * SoundRegistry.mediaInstances with FakeMediaInstance objects so that
 * export/stop/clear helpers work correctly.
 */
function stubChannelPlay() {
    return vi
        .spyOn(AudioChannel.prototype as any, "play")
        .mockImplementation(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            async function (
                this: AudioChannel,
                aliasOrMediaAlias: string,
                soundAliasOrOptions?: string | SoundPlayOptions,
                options?: SoundPlayOptions,
            ): Promise<MediaInterface> {
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
                const inst = makeFakeMediaInstance({
                    channelAlias: this.alias,
                    soundAlias,
                    volume: options?.volume ?? 1,
                    muted: (options as any)?.muted ?? false,
                    loop: options?.loop ?? false,
                });
                SoundRegistry.mediaInstances.set(mediaAlias, inst);
                inst.on("end", () => {
                    SoundRegistry.mediaInstances.delete(mediaAlias);
                });
                return inst;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
        );
}

/** Reset all sound-related state between tests. */
function clearSound() {
    SoundRegistry.mediaInstances.clear();
    SoundRegistry.channels.clear();
    SoundRegistry.bufferRegistry.clear();
    sound.defaultChannelAlias = "general";
}

// ---------------------------------------------------------------------------
// Tests: export format
// ---------------------------------------------------------------------------

describe("sound export format", () => {
    beforeEach(() => clearSound());

    test("export() returns { mediaInstances } format", () => {
        const exported = sound.export();
        expect(exported).toHaveProperty("mediaInstances");
        expect(exported).not.toHaveProperty("soundsPlaying");
        expect(exported).not.toHaveProperty("soundAliasesOrder");
    });

    test("export() returns empty mediaInstances when nothing is playing", () => {
        const exported = sound.export();
        expect(exported.mediaInstances).toEqual({});
    });

    test("export() uses mediaAlias (not soundAlias) as the map key", () => {
        const inst = makeFakeMediaInstance({ channelAlias: "general", soundAlias: "the-sound-alias", stepCounter: 1 });
        SoundRegistry.mediaInstances.set("the-media-alias", inst);

        const exported = sound.export();
        expect(exported.mediaInstances).toHaveProperty("the-media-alias");
        expect(exported.mediaInstances).not.toHaveProperty("the-sound-alias");
        expect(exported.mediaInstances["the-media-alias"].soundAlias).toBe("the-sound-alias");
    });

    test("two media aliases pointing to the same soundAlias both appear in export()", () => {
        SoundRegistry.mediaInstances.set("media1", makeFakeMediaInstance({ channelAlias: "general", soundAlias: "shared-sound", stepCounter: 1, volume: 1 }));
        SoundRegistry.mediaInstances.set("media2", makeFakeMediaInstance({ channelAlias: "general", soundAlias: "shared-sound", stepCounter: 1, volume: 0.5 }));

        const exported = sound.export();
        expect(exported.mediaInstances).toHaveProperty("media1");
        expect(exported.mediaInstances).toHaveProperty("media2");
        expect(exported.mediaInstances["media1"].soundAlias).toBe("shared-sound");
        expect(exported.mediaInstances["media2"].soundAlias).toBe("shared-sound");
    });

    test("export() preserves the per-instance stepCounter (not a global value)", () => {
        SoundRegistry.mediaInstances.set("early", makeFakeMediaInstance({ channelAlias: "general", soundAlias: "s1", stepCounter: 3 }));
        SoundRegistry.mediaInstances.set("late", makeFakeMediaInstance({ channelAlias: "general", soundAlias: "s2", stepCounter: 7 }));

        const exported = sound.export();
        expect(exported.mediaInstances["early"].stepCounter).toBe(3);
        expect(exported.mediaInstances["late"].stepCounter).toBe(7);
    });

    test("export() records paused state as true when sound is paused", () => {
        const inst = makeFakeMediaInstance({ channelAlias: "general", soundAlias: "s", stepCounter: 1 });
        inst.paused = true;
        SoundRegistry.mediaInstances.set("pausable", inst);

        const exported = sound.export();
        expect(exported.mediaInstances["pausable"].options.paused).toBe(true);
    });

    test("export() records paused state as false when sound is playing", () => {
        const inst = makeFakeMediaInstance({ channelAlias: "general", soundAlias: "s", stepCounter: 1 });
        SoundRegistry.mediaInstances.set("playing", inst);

        const exported = sound.export();
        expect(exported.mediaInstances["playing"].options.paused).toBe(false);
    });

    test("export() includes the channelAlias for each media instance", () => {
        sound.addChannel("bgm");
        SoundRegistry.mediaInstances.set("bgm-track", makeFakeMediaInstance({ channelAlias: "bgm", soundAlias: "music", stepCounter: 1, loop: true }));

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
        expect(chB.volume).toBeCloseTo(0.5);
    });

    test("pauseUnsavedAll/resumeUnsavedAll do not affect per-media paused state", () => {
        sound.addChannel("music");
        const inst = makeFakeMediaInstance({ channelAlias: "music", soundAlias: "music-track" });
        SoundRegistry.mediaInstances.set("music-track", inst);

        expect(inst.paused).toBe(false);

        // pauseUnsavedAll actually pauses playing instances, then resumeUnsavedAll restores them
        sound.pauseUnsavedAll("music");
        expect(inst.paused).toBe(true);

        sound.resumeUnsavedAll("music");
        expect(inst.paused).toBe(false);
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
        expect(SoundRegistry.mediaInstances.get("my-media")).toBeDefined();
    });

    test("play() with separate mediaAlias and soundAlias stores the correct soundAlias", async () => {
        await sound.play("media-alias", "sound-asset");
        expect(SoundRegistry.mediaInstances.get("media-alias")?.soundAlias).toBe("sound-asset");
    });

    test("stop() removes the media instance from tracking", async () => {
        await sound.play("stopper");
        expect(SoundRegistry.mediaInstances.get("stopper")).toBeDefined();
        sound.stop("stopper");
        expect(SoundRegistry.mediaInstances.get("stopper")).toBeUndefined();
    });

    test("clear() removes all tracked media instances", async () => {
        await sound.play("s1");
        await sound.play("s2");
        sound.clear();
        expect(Array.from(SoundRegistry.mediaInstances.keys())).toHaveLength(0);
    });

    test("play() without channel option uses the general channel by default", async () => {
        await sound.play("my-sound");
        expect(SoundRegistry.mediaInstances.get("my-sound")?.channelAlias).toBe("general");
    });

    test("play() with explicit channel option routes to the specified channel", async () => {
        sound.addChannel("bgm");
        await sound.play("my-sound", { channel: "bgm" });
        expect(SoundRegistry.mediaInstances.get("my-sound")?.channelAlias).toBe("bgm");
    });

    test("changing defaultChannelAlias routes subsequent play() calls to the new default", async () => {
        sound.addChannel("custom-default");
        sound.defaultChannelAlias = "custom-default";
        await sound.play("my-sound");
        expect(SoundRegistry.mediaInstances.get("my-sound")?.channelAlias).toBe("custom-default");
    });

    test("explicit channel option always overrides defaultChannelAlias", async () => {
        sound.addChannel("explicit-channel");
        sound.defaultChannelAlias = "other-default";
        await sound.play("my-sound", { channel: "explicit-channel" });
        expect(SoundRegistry.mediaInstances.get("my-sound")?.channelAlias).toBe(
            "explicit-channel",
        );
    });

    test("playTransient creates a Player without adding to tracked mediaInstances", async () => {
        const loadSpy = vi.spyOn(sound as any, "load").mockResolvedValue(undefined);
        SoundRegistry.bufferRegistry.set("ui-click", {} as any);
        try {
            sound.addChannel("pause-menu");
            // Use autostart: false to prevent player.start() from running against
            // the real (non-mocked) Tone.js audio context in this test environment.
            const result = await sound.playTransient("ui-click", { autostart: false, volume: 0.2 });
            expect(result).toBeDefined();
            expect(SoundRegistry.mediaInstances.has("ui-click")).toBe(false);
        } finally {
            SoundRegistry.bufferRegistry.delete("ui-click");
            loadSpy.mockRestore();
        }
    });
});

// ---------------------------------------------------------------------------
// Tests: stopTransientAll
// ---------------------------------------------------------------------------

describe("stopTransientAll", () => {
    beforeEach(() => clearSound());

    test("sound.stopTransientAll() calls stop() on every player in SoundRegistry.transients", () => {
        const player1 = { stop: vi.fn() } as any;
        const player2 = { stop: vi.fn() } as any;
        SoundRegistry.transients.add(player1);
        SoundRegistry.transients.add(player2);

        sound.stopTransientAll();

        expect(player1.stop).toHaveBeenCalledOnce();
        expect(player2.stop).toHaveBeenCalledOnce();
        expect(SoundRegistry.transients.size).toBe(0);
    });

    test("sound.stopTransientAll() does not affect media tracked by play()", () => {
        const inst = makeFakeMediaInstance({ channelAlias: "ch1", soundAlias: "bg" });
        SoundRegistry.mediaInstances.set("persistent", inst);

        sound.stopTransientAll();

        expect(inst.stop).not.toHaveBeenCalled();
    });

    test("transient removed before stopTransientAll() is not stopped", () => {
        const player = { stop: vi.fn() } as any;
        SoundRegistry.transients.add(player);
        // Simulate early removal (e.g. 'end' event fired before stopTransientAll)
        SoundRegistry.transients.delete(player);

        sound.stopTransientAll();

        expect(player.stop).not.toHaveBeenCalled();
    });

    test("sound.stopTransientAll() is chainable", () => {
        const result = sound.stopTransientAll();
        expect(result).toBe(sound);
    });
});

// ---------------------------------------------------------------------------
// Tests: pauseUnsavedAll / resumeUnsavedAll on SoundManager
// ---------------------------------------------------------------------------

describe("sound.pauseUnsavedAll / sound.resumeUnsavedAll", () => {
    beforeEach(() => clearSound());

    test("sound.pauseUnsavedAll() with a channel alias pauses only playing instances in that channel", () => {
        sound.addChannel("a");
        sound.addChannel("b");
        const instA = makeFakeMediaInstance({ channelAlias: "a", soundAlias: "s1" });
        const instB = makeFakeMediaInstance({ channelAlias: "b", soundAlias: "s2" });
        SoundRegistry.mediaInstances.set("s1", instA);
        SoundRegistry.mediaInstances.set("s2", instB);
        sound.pauseUnsavedAll("a");
        expect(instA.paused).toBe(true);
        expect(instB.paused).toBe(false);
    });

    test("sound.pauseUnsavedAll() without argument pauses all playing instances", () => {
        sound.addChannel("x");
        sound.addChannel("y");
        const instX = makeFakeMediaInstance({ channelAlias: "x", soundAlias: "sx" });
        const instY = makeFakeMediaInstance({ channelAlias: "y", soundAlias: "sy" });
        SoundRegistry.mediaInstances.set("sx", instX);
        SoundRegistry.mediaInstances.set("sy", instY);
        sound.pauseUnsavedAll();
        expect(instX.paused).toBe(true);
        expect(instY.paused).toBe(true);
    });

    test("sound.resumeUnsavedAll() with a channel alias resumes only system-paused instances in that channel", () => {
        sound.addChannel("a");
        sound.addChannel("b");
        const instA = makeFakeMediaInstance({ channelAlias: "a", soundAlias: "s1" });
        const instB = makeFakeMediaInstance({ channelAlias: "b", soundAlias: "s2" });
        SoundRegistry.mediaInstances.set("s1", instA);
        SoundRegistry.mediaInstances.set("s2", instB);
        sound.pauseUnsavedAll(); // pauses both
        sound.resumeUnsavedAll("a"); // resumes only channel "a"
        expect(instA.paused).toBe(false);
        expect(instB.paused).toBe(true); // still paused
    });

    test("sound.resumeUnsavedAll() without argument resumes all system-paused instances", () => {
        sound.addChannel("x");
        sound.addChannel("y");
        const instX = makeFakeMediaInstance({ channelAlias: "x", soundAlias: "sx" });
        const instY = makeFakeMediaInstance({ channelAlias: "y", soundAlias: "sy" });
        SoundRegistry.mediaInstances.set("sx", instX);
        SoundRegistry.mediaInstances.set("sy", instY);
        sound.pauseUnsavedAll();
        sound.resumeUnsavedAll();
        expect(instX.paused).toBe(false);
        expect(instY.paused).toBe(false);
    });

    test("resumeUnsavedAll does not resume instances that were already paused before pauseUnsavedAll", () => {
        sound.addChannel("music");
        const alreadyPaused = makeFakeMediaInstance({ channelAlias: "music", soundAlias: "track1", paused: true });
        const playing = makeFakeMediaInstance({ channelAlias: "music", soundAlias: "track2" });
        SoundRegistry.mediaInstances.set("track1", alreadyPaused);
        SoundRegistry.mediaInstances.set("track2", playing);

        sound.pauseUnsavedAll(); // should only system-pause "track2"
        expect(alreadyPaused.paused).toBe(true); // unchanged
        expect(playing.paused).toBe(true); // paused by system

        sound.resumeUnsavedAll(); // should only resume "track2"
        expect(alreadyPaused.paused).toBe(true); // still paused
        expect(playing.paused).toBe(false); // resumed by system
    });

    test("pauseUnsavedAll/resumeUnsavedAll do not mutate per-media paused option", () => {
        sound.addChannel("music");
        const inst = makeFakeMediaInstance({ channelAlias: "music", soundAlias: "track", stepCounter: 1 });
        SoundRegistry.mediaInstances.set("track", inst);
        expect(inst.paused).toBe(false);
        sound.pauseUnsavedAll("music");
        expect(inst.paused).toBe(true);
        sound.resumeUnsavedAll("music");
        expect(inst.paused).toBe(false);
    });

    test("pauseUnsavedAll and resumeUnsavedAll are chainable", () => {
        sound.addChannel("ch");
        expect(sound.pauseUnsavedAll("ch")).toBe(sound);
        expect(sound.resumeUnsavedAll("ch")).toBe(sound);
    });
});

// ---------------------------------------------------------------------------
// Tests: restore
// ---------------------------------------------------------------------------

describe("sound restore", () => {
    beforeEach(() => clearSound());

    test("restore() with empty mediaInstances leaves no active media", async () => {
        await sound.restore({ mediaInstances: {}, filters: [] });
        expect(Array.from(SoundRegistry.mediaInstances.keys())).toHaveLength(0);
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
     *
     * Note: options use Tone.js PlayerOptions keys (`mute`, `playbackRate`) so they
     * are correctly applied by MediaInstance's `memory` setter.
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
                        // Use Tone.js PlayerOptions keys so the memory setter picks them up
                        mute: opts.muted ?? false,
                        playbackRate: opts.speed ?? 1,
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
        } as SoundGameState;
    }

    /** Helper: create a fake MediaInstance already registered for bg-music on the bgm channel. */
    function makeRegisteredBgInst(overrides: Parameters<typeof makeFakeMediaInstance>[0] = {}) {
        const inst = makeFakeMediaInstance({ channelAlias: "bgm", soundAlias: "bg-music", ...overrides });
        SoundRegistry.mediaInstances.set("bg-music", inst);
        return inst;
    }

    test("restore() updates loop on a running background instance", async () => {
        sound.addChannel("bgm", { background: true });
        const inst = makeRegisteredBgInst({ loop: false });

        // stepCounter=99 in state differs from GameUnifier.stepCounter (0), so falls into the else branch
        await sound.restore(makeBackgroundState({ loop: true }));

        expect(inst.loop).toBe(true);
    });

    test("restore() updates volume on a running background instance", async () => {
        sound.addChannel("bgm", { background: true });
        const inst = makeRegisteredBgInst({ volume: 1 });

        await sound.restore(makeBackgroundState({ volume: 0.5 }));

        expect(inst.volume).toBe(0.5);
    });

    test("restore() updates muted on a running background instance", async () => {
        sound.addChannel("bgm", { background: true });
        const inst = makeRegisteredBgInst({ muted: false });

        await sound.restore(makeBackgroundState({ muted: true }));

        expect(inst.muted).toBe(true);
    });

    test("restore() updates speed on a running background instance", async () => {
        sound.addChannel("bgm", { background: true });
        const inst = makeRegisteredBgInst({ speed: 1 });

        await sound.restore(makeBackgroundState({ speed: 0.75 }));

        expect(inst.speed).toBe(0.75);
    });

    test("restore() updates paused on a running background instance", async () => {
        sound.addChannel("bgm", { background: true });
        const inst = makeRegisteredBgInst();

        await sound.restore(makeBackgroundState({ paused: true }));

        expect(inst.paused).toBe(true);
    });

    test("restore() does not change settings when they already match", async () => {
        sound.addChannel("bgm", { background: true });
        const inst = makeRegisteredBgInst({ loop: true, volume: 0.5, muted: false });

        await sound.restore(makeBackgroundState({ loop: true, volume: 0.5, muted: false }));

        // No changes expected
        expect(inst.loop).toBe(true);
        expect(inst.volume).toBe(0.5);
        expect(inst.muted).toBe(false);
    });

    test("restore() updates filters on a running background instance", async () => {
        sound.addChannel("bgm", { background: true });
        const inst = makeRegisteredBgInst();

        await sound.restore(makeBackgroundState({ filters: [] }));

        // Filters are applied to the instance (even if empty array)
        expect(inst.filters).toBeDefined();
    });

    test("restore() applies extra options to a running background instance without throwing", async () => {
        sound.addChannel("bgm", { background: true });
        makeRegisteredBgInst();

        await expect(
            sound.restore(makeBackgroundState({ delay: 2, end: 10, singleInstance: true, start: 1 })),
        ).resolves.not.toThrow();

        // Instance is still registered after restore
        expect(SoundRegistry.mediaInstances.has("bg-music")).toBe(true);
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
