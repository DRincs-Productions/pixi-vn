import { Keyv } from "keyv";
import { expect, test } from "vitest";
import { storage } from "../src";
import { CacheableStoreItem } from "../src/interfaces/export/ExportedStorage";

test("setVariable & getVariable", async () => {
    storage.setVariable("test", "test1");
    expect(storage.getVariable("test")).toBe("test1");
    expect(storage.getVariable("Test")).toBe("test1");

    storage.setVariable("Test", "test2");
    expect(storage.getVariable("test")).toBe(undefined);
    expect(storage.getVariable("Test")).toBe("test2");

    storage.setVariable("test", "test3");
    expect(storage.getVariable("test")).toBe("test3");
    expect(storage.getVariable("Test")).toBe("test2");
});

test("clear & startingStorage", async () => {
    storage.setVariable("variable1", {
        test: "test",
        test2: 1,
    });
    storage.setVariable("variable2", 435);
    storage.setVariable("variable3", "test");
    storage.setVariable("variable4", true);
    storage.setVariable("variable5", false);
    storage.setVariable("variable6", null);
    storage.setVariable("variable7", undefined);

    storage.clear();
    let items: CacheableStoreItem[] = [];
    [...storage.storage.keys()].forEach((key) => {
        items.push({ key, value: storage.storage.get(key) });
    });
    expect(items.length).toBe(0);

    storage.startingStorage = {
        a: 1,
        b: "test",
        c: true,
        d: false,
        e: null,
        f: undefined,
    };
    storage.setVariable("variable2", 435);
    storage.setVariable("variable3", "test");
    storage.setVariable("variable4", true);
    storage.setVariable("variable5", false);
    storage.setVariable("variable6", null);
    storage.setVariable("variable7", undefined);

    storage.clear();
    let items2: CacheableStoreItem[] = [];
    [...storage.storage.keys()].forEach((key) => {
        items2.push({ key, value: storage.storage.get(key) });
    });
    expect(items2.length).toBe(6);
});

test("import & exoprt", async () => {
    storage.import({
        a: 1,
        b: "test",
        c: true,
        d: false,
        e: null,
        f: undefined,
    });
    expect(storage.getVariable("a")).toBe(1);
    expect(storage.getVariable("b")).toBe("test");
    expect(storage.getVariable("c")).toBe(true);
    expect(storage.getVariable("d")).toBe(false);
    expect(storage.getVariable("e")).toBe(null);
    expect(storage.getVariable("f")).toBe(undefined);
    let exported = storage.export();
    expect(exported).toEqual([
        {
            key: "a",
            value: 1,
        },
        {
            key: "b",
            value: "test",
        },
        {
            key: "c",
            value: true,
        },
        {
            key: "d",
            value: false,
        },
        {
            key: "e",
            value: null,
        },
        {
            key: "f",
        },
    ]);
});

test("Keyv", async () => {
    const keyvStorage = new Keyv({ store: storage.storage });
    await keyvStorage.set("a", 1);
    await keyvStorage.set("b", "test");
    await keyvStorage.set("c", true);
    await keyvStorage.set("d", false);

    expect(await keyvStorage.get("a")).toBe(1);
    expect(await keyvStorage.get("b")).toBe("test");
    expect(await keyvStorage.get("c")).toBe(true);
    expect(await keyvStorage.get("d")).toBe(false);
});
