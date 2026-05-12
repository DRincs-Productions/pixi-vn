import { describe, expect, test, vi } from "vitest";

describe("AudioChannel _createPlayer elapsed normalization", () => {
    test("clamps negative elapsed when autostarting a new play", async () => {
        vi.resetModules();

        class MockMediaInstance {
            start = vi.fn();
            chain = vi.fn(function () {
                return this;
            });
            constructor(
                readonly alias: string,
                readonly channelAlias: string,
                readonly soundAlias: string,
                readonly stepCounter: number,
                readonly options: unknown,
                readonly delay?: number,
            ) {}
        }

        vi.doMock("@sound/classes/MediaInstance", () => ({ default: MockMediaInstance }));
        vi.doMock("@drincs/pixi-vn/core", () => ({
            GameUnifier: { stepCounter: 0 },
            PixiError: class extends Error {
                constructor(_code: string, message: string) {
                    super(message);
                }
            },
        }));
        vi.doMock("tone", () => ({
            Channel: class {
                volume = { value: 0 };
                pan = { value: 0 };
                mute = false;
                toDestination() {
                    return this;
                }
                chain() {
                    return this;
                }
            },
        }));

        const { default: AudioChannel } = await import("../src/sound/classes/AudioChannel");
        const { default: SoundRegistry } = await import("../src/sound/SoundRegistry");

        SoundRegistry.bufferRegistry.clear();
        SoundRegistry.bufferRegistry.set("sfx", {} as any);
        const channel = new AudioChannel("sfx-channel");

        const media = (channel as any)._createPlayer("media", "sfx", { elapsed: -2, autostart: true });

        expect(media.start).toHaveBeenLastCalledWith(undefined, 0);
    });
});
