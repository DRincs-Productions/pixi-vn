import { Keyv } from "keyv";
import { expect, test } from "vitest";
import { narration, newLabel, storage, StorageManagerStatic } from "../src";
import { MAIN_STORAGE_KEY, TEMP_STORAGE_KEY } from "../src/constants";
import type { StorageGameStateItem } from "../src/storage/interfaces/StorageGameState";

const temTestLabel = newLabel<{
    counter: number;
}>("tempStorageCounter", [
    ({ counter }) => {
        storage.setTempVariable("counter", counter + 1);
    },
    () => {
        const counter = storage.get<number>("counter") || 0;
        storage.setTempVariable("counter", counter + 1);
    },
    () => {
        const counter = storage.get<number>("counter") || 0;
        storage.setTempVariable("counter", counter + 1);
    },
    async (props, { labelId }) => {
        const counter = storage.get<number>("counter") || 0;
        return await narration.call(labelId, {
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

test("clear & default", async () => {
    storage.default = {
        variable1: 1,
        variable2: 2,
        variable3: 3,
        variable4: 4,
        variable5: 5,
        variable6: 6,
        variable7: 7,
    };
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
    const items: StorageGameStateItem[] = [];
    [...storage.base.keys()].forEach((key) => {
        items.push({ key, value: storage.base.get(key) });
    });
    expect(items.length).toBe(0);
    expect(storage.get("variable1")).toEqual(1);
    expect(storage.get("variable2")).toEqual(2);
    expect(storage.get("variable3")).toEqual(3);
    expect(storage.get("variable4")).toEqual(4);
    expect(storage.get("variable5")).toEqual(5);
    expect(storage.get("variable6")).toEqual(6);
    expect(storage.get("variable7")).toEqual(7);

    storage.set("variable2", 435);
    storage.set("variable3", "test");
    storage.set("variable4", true);
    storage.set("variable5", false);
    storage.set("variable6", null);
    storage.set("variable7", undefined);

    expect(storage.get("variable1")).toEqual(1);
    expect(storage.get("variable2")).toEqual(435);
    expect(storage.get("variable3")).toEqual("test");
    expect(storage.get("variable4")).toEqual(true);
    expect(storage.get("variable5")).toEqual(false);
    expect(storage.get("variable6")).toEqual(6);
    expect(storage.get("variable7")).toEqual(7);

    const items2: StorageGameStateItem[] = [];
    [...storage.base.keys()].forEach((key) => {
        items2.push({ key, value: storage.base.get(key) });
    });
    expect(items2.length).toBe(4);
    storage.clear();
});

test("setTempVariable & getTempVariable", async () => {
    storage.set("counter", 0);
    await narration.call(temTestLabel, { counter: 5 });
    await narration.continue({});
    expect(storage.get("counter")).toBe(7);
    await narration.continue({});
    expect(storage.get("counter")).toBe(8);
    await narration.continue({});
    expect(storage.get("counter")).toBe(9);
    await narration.continue({});
    expect(storage.get("counter")).toBe(10);
    await narration.continue({});
    expect(storage.get("counter")).toBe(11);
    await narration.continue({});
    expect(storage.get("counter")).toBe(12);
    await narration.continue({});
    expect(storage.get("counter")).toBe(13);
    await narration.continue({});
    expect(storage.get("counter")).toBe(14);
    await narration.continue({});
    expect(storage.get("counter")).toBe(15);
    await narration.continue({});
    storage.set("counter", 1);
    expect(storage.get("counter")).toBe(16);
    await narration.continue({});
    expect(storage.get("counter")).toBe(17);
    await narration.continue({});
    expect(storage.get("counter")).toBe(18);
    await narration.continue({});
    expect(storage.get("counter")).toBe(19);
    await narration.continue({});
    expect(storage.get("counter")).toBe(20);
    await narration.continue({});
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

test("storage external handler is triggered with unprefixed keys", async () => {
    const setEvents: Array<{ key: string; value: unknown }> = [];
    const removeEvents: string[] = [];
    const clearEvents: string[] = [];
    storage.setStorageHandler({
        onSetVariable: (key, value) => setEvents.push({ key, value }),
        onRemoveVariable: (key) => removeEvents.push(key),
        onClearOldTempVariable: (key) => clearEvents.push(key),
    });
    try {
        StorageManagerStatic.setVariable(MAIN_STORAGE_KEY, "ext-main", 42);
        StorageManagerStatic.removeVariable(MAIN_STORAGE_KEY, "ext-main");
        StorageManagerStatic.setVariable(TEMP_STORAGE_KEY, "ext-temp", "temp-value");
        StorageManagerStatic.tempStorageDeadlines.set("ext-temp", 10);
        StorageManagerStatic.clearOldTempVariables(1);

        expect(setEvents).toContainEqual({ key: "ext-main", value: 42 });
        expect(setEvents).toContainEqual({ key: "ext-temp", value: "temp-value" });
        expect(removeEvents).toContain("ext-main");
        expect(clearEvents).toContain("ext-temp");
    } finally {
        storage.setStorageHandler(undefined);
        StorageManagerStatic.removeVariable(MAIN_STORAGE_KEY, "ext-main");
        StorageManagerStatic.removeVariable(TEMP_STORAGE_KEY, "ext-temp");
        StorageManagerStatic.tempStorageDeadlines.delete("ext-temp");
    }
});

test("import & export", async () => {
    storage.restore({
        main: [
            {
                key: `${MAIN_STORAGE_KEY}:a`,
                value: 1,
            },
            {
                key: `${MAIN_STORAGE_KEY}:b`,
                value: "test",
            },
            {
                key: `${MAIN_STORAGE_KEY}:c`,
                value: true,
            },
            {
                key: `${MAIN_STORAGE_KEY}:d`,
                value: false,
            },
            {
                key: `${MAIN_STORAGE_KEY}:e`,
                value: null,
            },
            {
                key: `${MAIN_STORAGE_KEY}:f`,
                value: undefined,
            },
        ],
        tempDeadlines: [],
    });
    expect(storage.get("a")).toBe(1);
    expect(storage.get("b")).toBe("test");
    expect(storage.get("c")).toBe(true);
    expect(storage.get("d")).toBe(false);
    expect(storage.get("e")).toBe(null);
    expect(storage.get("f")).toBe(undefined);
    const exported = storage.export();
    expect(exported).toEqual({
        main: [
            {
                key: "storage:a",
                value: 1,
            },
            {
                key: "storage:b",
                value: "test",
            },
            {
                key: "storage:c",
                value: true,
            },
            {
                key: "storage:d",
                value: false,
            },
            {
                key: "storage:e",
                value: null,
            },
            {
                key: "storage:f",
            },
        ],
        tempDeadlines: [],
    });
});

test("Keyv", async () => {
    const keyvStorage = new Keyv({ store: storage.base });
    await keyvStorage.set("a", 1);
    await keyvStorage.set("b", "test");
    await keyvStorage.set("c", true);
    await keyvStorage.set("d", false);

    expect(await keyvStorage.get("a")).toBe(1);
    expect(await keyvStorage.get("b")).toBe("test");
    expect(await keyvStorage.get("c")).toBe(true);
    expect(await keyvStorage.get("d")).toBe(false);
});
