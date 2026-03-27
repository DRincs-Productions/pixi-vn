import { expect, test, vi } from "vitest";
import { GameUnifier } from "../src";

test("addOnError: handlers run in registration order", async () => {
    GameUnifier.clearOnErrorHandlers();
    const order: number[] = [];
    const handler1 = async () => {
        order.push(1);
    };
    const handler2 = async () => {
        order.push(2);
    };
    GameUnifier.addOnError(handler1);
    GameUnifier.addOnError(handler2);
    await GameUnifier.runOnError(new Error("test"), {} as any);
    expect(order).toEqual([1, 2]);
    GameUnifier.clearOnErrorHandlers();
});

test("runOnError: a throwing handler does not prevent later handlers from running", async () => {
    GameUnifier.clearOnErrorHandlers();
    const spy = vi.fn();
    const throwingHandler = async () => {
        throw new Error("handler error");
    };
    const safeHandler = async () => {
        spy();
    };
    GameUnifier.addOnError(throwingHandler);
    GameUnifier.addOnError(safeHandler);
    await GameUnifier.runOnError(new Error("test"), {} as any);
    expect(spy).toHaveBeenCalledOnce();
    GameUnifier.clearOnErrorHandlers();
});

test("removeOnError: stops a handler from running", async () => {
    GameUnifier.clearOnErrorHandlers();
    const spy = vi.fn();
    const handler = async () => {
        spy();
    };
    GameUnifier.addOnError(handler);
    GameUnifier.removeOnError(handler);
    await GameUnifier.runOnError(new Error("test"), {} as any);
    expect(spy).not.toHaveBeenCalled();
    GameUnifier.clearOnErrorHandlers();
});
