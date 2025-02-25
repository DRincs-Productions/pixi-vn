import { expect, test } from "vitest";
import { storage } from "./src";

test("setVariable & getVariable", async () => {
    storage.setVariable("test", "test");
    expect(storage.getVariable("test")).toBe("test");

    storage.setVariable("test", "test");
    expect(storage.getVariable("Test")).toBe("test");

    storage.setVariable("Test", "Test");
    expect(storage.getVariable("test")).toBe(undefined);
});
