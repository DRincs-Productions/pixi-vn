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
        let counter = storage.getVariable<number>("counter") || 0;
        storage.setTempVariable("counter", counter + 1);
    },
    () => {
        let counter = storage.getVariable<number>("counter") || 0;
        storage.setTempVariable("counter", counter + 1);
    },
    async (props, { labelId }) => {
        let counter = storage.getVariable<number>("counter") || 0;
        return await narration.callLabel(labelId, {
            counter,
            ...props,
        });
    },
]);

test("setVariable & getVariable", async () => {
    storage.setVariable("test", "test1");
    expect(storage.getVariable("test")).toBe("test1");
    expect(storage.getVariable("Test")).toBe(undefined);

    storage.setVariable("Test", "test2");
    expect(storage.getVariable("test")).toBe("test1");
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
    storage.setVariable("variable2", 435);
    storage.setVariable("variable3", "test");
    storage.setVariable("variable4", true);
    storage.setVariable("variable5", false);
    storage.setVariable("variable6", null);
    storage.setVariable("variable7", undefined);

    storage.clear();
    let items2: StorageGameStateItem[] = [];
    [...storage.storage.keys()].forEach((key) => {
        items2.push({ key, value: storage.storage.get(key) });
    });
    expect(items2.length).toBe(6);
});

test("setTempVariable & getTempVariable", async () => {
    storage.setVariable("counter", 0);
    await narration.callLabel(temTestLabel, { counter: 5 });
    await narration.goNext({});
    expect(storage.getVariable("counter")).toBe(7);
    await narration.goNext({});
    expect(storage.getVariable("counter")).toBe(8);
    await narration.goNext({});
    expect(storage.getVariable("counter")).toBe(9);
    await narration.goNext({});
    expect(storage.getVariable("counter")).toBe(10);
    await narration.goNext({});
    expect(storage.getVariable("counter")).toBe(11);
    await narration.goNext({});
    expect(storage.getVariable("counter")).toBe(12);
    await narration.goNext({});
    expect(storage.getVariable("counter")).toBe(13);
    await narration.goNext({});
    expect(storage.getVariable("counter")).toBe(14);
    await narration.goNext({});
    expect(storage.getVariable("counter")).toBe(15);
    await narration.goNext({});
    storage.setVariable("counter", 1);
    expect(storage.getVariable("counter")).toBe(16);
    await narration.goNext({});
    expect(storage.getVariable("counter")).toBe(17);
    await narration.goNext({});
    expect(storage.getVariable("counter")).toBe(18);
    await narration.goNext({});
    expect(storage.getVariable("counter")).toBe(19);
    await narration.goNext({});
    expect(storage.getVariable("counter")).toBe(20);
    await narration.goNext({});
    expect(storage.getVariable("counter")).toBe(21);
    storage.setVariable("test", "test");
    storage.setTempVariable("test", "no");
    narration.closeCurrentLabel();
    expect(storage.getVariable("counter")).toBe(21);
    expect(storage.getVariable("test")).toBe("test");
    narration.closeAllLabels();
    expect(storage.getVariable("counter")).toBe(1);
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
    expect(storage.getVariable("a")).toBe(1);
    expect(storage.getVariable("b")).toBe("test");
    expect(storage.getVariable("c")).toBe(true);
    expect(storage.getVariable("d")).toBe(false);
    expect(storage.getVariable("e")).toBe(null);
    expect(storage.getVariable("f")).toBe(undefined);
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
