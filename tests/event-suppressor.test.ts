import type { FederatedPointerEvent } from "@drincs/pixi-vn/pixi.js";
import { describe, expect, expectTypeOf, test, vi } from "vitest";
import { AnimatedSprite, EventSuppressor } from "../src/canvas";
import type { EventSuppressorTarget } from "../src/canvas";

function deferred() {
    let resolve!: () => void;
    let reject!: (e: unknown) => void;
    const promise = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

function createTarget() {
    return { emit: vi.fn((_event: any, ..._args: any[]) => true) };
}

describe("EventSuppressor", () => {
    test("emits the event with its arguments when not silenced", () => {
        const suppressor = new EventSuppressor();
        const target = createTarget();
        expect(suppressor.silent).toBe(false);
        expect(suppressor.emit(target, "ended", 1, "a")).toBe(true);
        expect(target.emit).toHaveBeenCalledWith("ended", 1, "a");
    });

    test("silences the events during run() and returns its result", async () => {
        const suppressor = new EventSuppressor();
        const target = createTarget();
        const result = await suppressor.run(() => {
            expect(suppressor.emit(target, "ended")).toBe(false);
            return 42;
        });
        expect(result).toBe(42);
        expect(target.emit).not.toHaveBeenCalled();
        expect(suppressor.silent).toBe(false);
    });

    test("nested calls keep the events silenced until the outer one ends", async () => {
        const suppressor = new EventSuppressor();
        await suppressor.run(async () => {
            await suppressor.run(async () => {
                expect(suppressor.silent).toBe(true);
            });
            expect(suppressor.silent).toBe(true);
        });
        expect(suppressor.silent).toBe(false);
    });

    test("concurrent calls keep the events silenced until the last one ends, in any order", async () => {
        const suppressor = new EventSuppressor();
        const first = deferred();
        const second = deferred();
        const runFirst = suppressor.run(() => first.promise);
        const runSecond = suppressor.run(() => second.promise);

        // the first call ends before the second (not in LIFO order)
        first.resolve();
        await runFirst;
        expect(suppressor.silent).toBe(true);

        second.resolve();
        await runSecond;
        expect(suppressor.silent).toBe(false);
    });

    test("recovers after a synchronous throw or a rejection", async () => {
        const suppressor = new EventSuppressor();
        await expect(
            suppressor.run(() => {
                throw new Error("sync failure");
            }),
        ).rejects.toThrow("sync failure");
        expect(suppressor.silent).toBe(false);

        const pending = deferred();
        const failing = suppressor.run(() => pending.promise);
        expect(suppressor.silent).toBe(true);
        pending.reject(new Error("async failure"));
        await expect(failing).rejects.toThrow("async failure");
        expect(suppressor.silent).toBe(false);
    });

    test("emit checks the event and arguments of a typed target", () => {
        const suppressor = new EventSuppressor();
        const target: EventSuppressorTarget<"ended", [time: number]> = { emit: () => true };
        expect(suppressor.emit(target, "ended", 1)).toBe(true);
        // @ts-expect-error wrong argument type
        suppressor.emit(target, "ended", "1");
        // @ts-expect-error unknown event
        suppressor.emit(target, "started", 1);
    });

    test("a failing call doesn't end the silence of a concurrent one", async () => {
        const suppressor = new EventSuppressor();
        const pending = deferred();
        const running = suppressor.run(() => pending.promise);
        await expect(suppressor.run(() => Promise.reject(new Error("failure")))).rejects.toThrow();
        expect(suppressor.silent).toBe(true);
        pending.resolve();
        await running;
        expect(suppressor.silent).toBe(false);
    });
});

describe("AnimatedSprite.withSilentEvents", () => {
    test("silences the animation events, also with concurrent calls ending out of order", async () => {
        const sprite = new AnimatedSprite();
        const loop = vi.fn();
        sprite.on("loop", loop);

        const first = deferred();
        const second = deferred();
        const runFirst = sprite.withSilentEvents(() => first.promise);
        const runSecond = sprite.withSilentEvents(() => second.promise);

        first.resolve();
        await runFirst;
        sprite.onLoop?.();
        expect(loop).not.toHaveBeenCalled();

        second.resolve();
        await runSecond;
        sprite.onLoop?.();
        expect(loop).toHaveBeenCalledTimes(1);
        expect(loop).toHaveBeenCalledWith(sprite);
    });

    test("recovers after a failure", async () => {
        const sprite = new AnimatedSprite();
        const complete = vi.fn();
        sprite.on("complete", complete);

        await expect(
            sprite.withSilentEvents(() => {
                throw new Error("failure");
            }),
        ).rejects.toThrow("failure");
        sprite.onComplete?.();
        expect(complete).toHaveBeenCalledWith(sprite);
    });

    test("listeners are contextually typed", () => {
        // the extra member keeps MySprite from being structurally equal to AnimatedSprite
        class MySprite extends AnimatedSprite {
            readonly mySprite = true;
        }
        const sprite = new MySprite();
        sprite.on("complete", (component) => {
            expectTypeOf(component).toEqualTypeOf<MySprite>();
        });
        sprite.on("frameChange", (currentFrame, component) => {
            expectTypeOf(currentFrame).toEqualTypeOf<number>();
            expectTypeOf(component).toEqualTypeOf<MySprite>();
        });
        sprite.on("pointerdown", (event, component) => {
            expectTypeOf(event).toEqualTypeOf<FederatedPointerEvent>();
            expectTypeOf(component).toEqualTypeOf<MySprite>();
        });
    });

    test("doesn't silence pointer events", async () => {
        const sprite = new AnimatedSprite();
        const pointer = vi.fn();
        sprite.on("pointerdown", pointer);

        await sprite.withSilentEvents(() => {
            sprite.emit("pointerdown", {} as any);
        });
        expect(pointer).toHaveBeenCalledTimes(1);
    });
});
