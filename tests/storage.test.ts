import { Keyv } from "keyv";
import { expect, test } from "vitest";
import { narration, newLabel, storage } from "../src";
import { StorageGameStateItem } from "../src/storage/interfaces/StorageGameState";

const temTestLabel = newLabel<{
    counter: number;
}>("tempStorageCounter", [
    ({ counter }) => {
        storage.setTempVariable("counter", counter + 1);
    },
    () => {
        let counter = storage.get<number>("counter") || 0;
        storage.setTempVariable("counter", counter + 1);
    },
    () => {
        let counter = storage.get<number>("counter") || 0;
        storage.setTempVariable("counter", counter + 1);
    },
    async (props, { labelId }) => {
        let counter = storage.get<number>("counter") || 0;
        return await narration.callLabel(labelId, {
            counter,
            ...props,
        });
    },
]);

test("setVariable & getVariable", async () => {
    storage.set("test", "test1");
    expect(storage.get("test")).toBe("test1");
    expect(storage.get("Test")).toBe(undefined);

    storage.set("Test", "test2");
    expect(storage.get("test")).toBe("test1");
    expect(storage.get("Test")).toBe("test2");

    storage.set("test", "test3");
    expect(storage.get("test")).toBe("test3");
    expect(storage.get("Test")).toBe("test2");
});

test("clear & startingStorage", async () => {
    storage.set("variable1", {
        test: "test",
        test2: 1,
    });
    storage.set("variable2", 435);
    storage.set("variable3", "test");
    storage.set("variable4", true);
    storage.set("variable5", false);
    storage.set("variable6", null);
    storage.set("variable7", undefined);

    storage.clear();
    let items: StorageGameStateItem[] = [];
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
    storage.set("variable2", 435);
    storage.set("variable3", "test");
    storage.set("variable4", true);
    storage.set("variable5", false);
    storage.set("variable6", null);
    storage.set("variable7", undefined);

    storage.clear();
    let items2: StorageGameStateItem[] = [];
    [...storage.storage.keys()].forEach((key) => {
        items2.push({ key, value: storage.storage.get(key) });
    });
    expect(items2.length).toBe(6);
});

test("setTempVariable & getTempVariable", async () => {
    storage.set("counter", 0);
    await narration.callLabel(temTestLabel, { counter: 5 });
    await narration.goNext({});
    expect(storage.get("counter")).toBe(7);
    await narration.goNext({});
    expect(storage.get("counter")).toBe(8);
    await narration.goNext({});
    expect(storage.get("counter")).toBe(9);
    await narration.goNext({});
    expect(storage.get("counter")).toBe(10);
    await narration.goNext({});
    expect(storage.get("counter")).toBe(11);
    await narration.goNext({});
    expect(storage.get("counter")).toBe(12);
    await narration.goNext({});
    expect(storage.get("counter")).toBe(13);
    await narration.goNext({});
    expect(storage.get("counter")).toBe(14);
    await narration.goNext({});
    expect(storage.get("counter")).toBe(15);
    await narration.goNext({});
    storage.set("counter", 1);
    expect(storage.get("counter")).toBe(16);
    await narration.goNext({});
    expect(storage.get("counter")).toBe(17);
    await narration.goNext({});
    expect(storage.get("counter")).toBe(18);
    await narration.goNext({});
    expect(storage.get("counter")).toBe(19);
    await narration.goNext({});
    expect(storage.get("counter")).toBe(20);
    await narration.goNext({});
    expect(storage.get("counter")).toBe(21);
    storage.set("test", "test");
    storage.setTempVariable("test", "no");
    narration.closeCurrentLabel();
    expect(storage.get("counter")).toBe(21);
    expect(storage.get("test")).toBe("test");
    narration.closeAllLabels();
    expect(storage.get("counter")).toBe(1);
});

test("setFlag & getFlag", async () => {
    storage.setFlag("test", true);
    expect(storage.getFlag("test")).toBe(true);
    expect(storage.getFlag("Test")).toBe(false);
    storage.setFlag("Test", true);
    expect(storage.getFlag("test")).toBe(true);
    expect(storage.getFlag("Test")).toBe(true);
    storage.setFlag("test", false);
    expect(storage.getFlag("test")).toBe(false);
    expect(storage.getFlag("Test")).toBe(true);
    storage.setFlag("test", true);
    expect(storage.getFlag("test")).toBe(true);
    expect(storage.getFlag("Test")).toBe(true);
    storage.setFlag("test", false);
    expect(storage.getFlag("test")).toBe(false);
    expect(storage.getFlag("Test")).toBe(true);
    storage.setFlag("test", true);
    expect(storage.getFlag("test")).toBe(true);
    expect(storage.getFlag("Test")).toBe(true);
    storage.setFlag("test", false);
    expect(storage.getFlag("test")).toBe(false);
    expect(storage.getFlag("Test")).toBe(true);
    storage.setFlag("test", true);
    expect(storage.getFlag("test")).toBe(true);
    expect(storage.getFlag("Test")).toBe(true);
    storage.setFlag("test", false);
});

test("import & exoprt", async () => {
    storage.restore({
        a: 1,
        b: "test",
        c: true,
        d: false,
        e: null,
        f: undefined,
    });
    expect(storage.get("a")).toBe(1);
    expect(storage.get("b")).toBe("test");
    expect(storage.get("c")).toBe(true);
    expect(storage.get("d")).toBe(false);
    expect(storage.get("e")).toBe(null);
    expect(storage.get("f")).toBe(undefined);
    let exported = storage.export();
    expect(exported).toEqual({
        base: [
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
        ],
        temp: [],
        tempDeadlines: [],
        flags: [],
    });
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
