import { expect, test, vi } from "vitest";
import { canvas, drawCanvasErrorHandler, GameUnifier, StepLabelPropsType } from "../src";
import { PixiError } from "@drincs/pixi-vn/core";

const emptyProps: StepLabelPropsType = {};

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
    await GameUnifier.runOnError(new Error("test"), emptyProps);
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
    await GameUnifier.runOnError(new Error("test"), emptyProps);
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
    await GameUnifier.runOnError(new Error("test"), emptyProps);
    expect(spy).not.toHaveBeenCalled();
    GameUnifier.clearOnErrorHandlers();
});

test("drawCanvasErrorHandler: adds placeholder element when PixiError has canvasElementInfo with label", async () => {
    const addSpy = vi.spyOn(canvas, "add").mockImplementation(() => {});
    const handler = drawCanvasErrorHandler();
    const error = new PixiError("unregistered_asset", "Test error", "canvas", {
        pixivnId: "test-container",
        label: "mySprite",
    });

    await handler(error, {});

    expect(addSpy).toHaveBeenCalledOnce();
    expect(addSpy.mock.calls[0][0]).toBe("mySprite");
    addSpy.mockRestore();
});

test("drawCanvasErrorHandler: falls back to pixivnId when label is absent", async () => {
    const addSpy = vi.spyOn(canvas, "add").mockImplementation(() => {});
    const handler = drawCanvasErrorHandler();
    const error = new PixiError("unregistered_asset", "Test error", "canvas", {
        pixivnId: "fallback-id",
    });

    await handler(error, {});

    expect(addSpy).toHaveBeenCalledOnce();
    expect(addSpy.mock.calls[0][0]).toBe("fallback-id");
    addSpy.mockRestore();
});

test("drawCanvasErrorHandler: does not add placeholder when error has no canvasElementInfo", async () => {
    const addSpy = vi.spyOn(canvas, "add").mockImplementation(() => {});
    const handler = drawCanvasErrorHandler();

    await handler(new Error("generic error"), {});

    expect(addSpy).not.toHaveBeenCalled();
    addSpy.mockRestore();
});
