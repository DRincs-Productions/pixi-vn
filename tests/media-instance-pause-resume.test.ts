import { describe, expect, test, vi } from "vitest";

describe("MediaInstance pause/resume", () => {
    test("resume keeps the correct offset when delay is set", async () => {
        vi.resetModules();

        let now = 0;
        class MockPlayer {
            volume = { value: 0 };
            mute = false;
            loop = false;
            loopEnd = 0;
            loopStart = 0;
            playbackRate = 1;
            reverse = false;
            fadeIn = 0;
            state: "started" | "stopped" = "stopped";
            start(time?: string, offset?: number) {
                void time;
                void offset;
                this.state = "started";
                return this;
            }
            stop() {
                this.state = "stopped";
                return this;
            }
            chain() {
                return this;
            }
            disconnect() {
                return this;
            }
            constructor(options?: unknown) {
                void options;
            }
        }

        const startSpy = vi.spyOn(MockPlayer.prototype, "start");
        const stopSpy = vi.spyOn(MockPlayer.prototype, "stop");

        vi.doMock("tone", () => ({
            Player: MockPlayer,
            now: () => now,
        }));

        const { default: MediaInstance } = await import("../src/sound/classes/MediaInstance");

        const media = new MediaInstance("media", "music", "track", 1, {}, 2);
        media.start("+2");
        now = 5;
        media.paused = true;
        media.paused = false;

        expect(stopSpy).toHaveBeenCalledTimes(1);
        expect(startSpy).toHaveBeenLastCalledWith("+2", 3);
    });

    test("resume does not clamp negative offset before delayed start", async () => {
        vi.resetModules();

        let now = 0;
        class MockPlayer {
            volume = { value: 0 };
            mute = false;
            loop = false;
            loopEnd = 0;
            loopStart = 0;
            playbackRate = 1;
            reverse = false;
            fadeIn = 0;
            state: "started" | "stopped" = "stopped";
            start(time?: string, offset?: number) {
                void time;
                void offset;
                this.state = "started";
                return this;
            }
            stop() {
                this.state = "stopped";
                return this;
            }
            chain() {
                return this;
            }
            disconnect() {
                return this;
            }
            constructor(options?: unknown) {
                void options;
            }
        }

        const startSpy = vi.spyOn(MockPlayer.prototype, "start");

        vi.doMock("tone", () => ({
            Player: MockPlayer,
            now: () => now,
        }));

        const { default: MediaInstance } = await import("../src/sound/classes/MediaInstance");

        const media = new MediaInstance("media", "music", "track", 1, {}, 2);
        media.start("+2");
        now = 1;
        media.paused = true;
        media.paused = false;

        expect(startSpy).toHaveBeenLastCalledWith("+2", -1);
    });
});
