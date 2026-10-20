import { describe, expect, it } from "vitest";
import CachedMap from "../src/classes/CachedMap";

describe("CachedMap", () => {
    it("keeps its Map behavior while using the LRU cache for lookups", () => {
        const map = new CachedMap<string, number>({ cacheSize: 2 });

        map.set("a", 1).set("b", 2).set("c", 3);

        expect(map.size).toBe(3);
        expect(map.get("a")).toBe(1);
        expect(map.get("b")).toBe(2);
        expect(map.get("c")).toBe(3);
        expect([...map.entries()]).toEqual([
            ["a", 1],
            ["b", 2],
            ["c", 3],
        ]);

        expect(map.delete("b")).toBe(true);
        expect(map.has("b")).toBe(false);
        map.clear();
        expect(map.size).toBe(0);
        expect(map.cache.size).toBe(0);
    });

    it("returns falsy values stored in the backing map", () => {
        const map = new CachedMap<string, number | boolean | string>({ cacheSize: 2 });

        map.set("zero", 0).set("false", false).set("empty", "");

        expect(map.get("zero")).toBe(0);
        expect(map.get("false")).toBe(false);
        expect(map.get("empty")).toBe("");
    });
});
