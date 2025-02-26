import { expect, test } from "vitest";
import { storage } from "../src";

test("setVariable & getVariable", async () => {
    storage.setVariable("test", "test1");
    expect(storage.getVariable("test")).toBe("test1");

    storage.setVariable("Test", "test2");
    expect(storage.getVariable("Test")).toBe("test2");

    storage.setVariable("test", "test3");
    expect(storage.getVariable("test")).toBe(undefined);
});
