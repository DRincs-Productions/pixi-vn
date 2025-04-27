import { LRUCache } from "lru-cache";

export default class CachedMap<K extends {}, V extends {}> implements Map<K, V> {
    readonly cache: LRUCache<K, V>;
    readonly map: Map<K, V> = new Map();
    constructor(options: { cacheSize: number }) {
        this.cache = new LRUCache<K, V>({
            max: options.cacheSize,
        });
        this.map = new Map();
    }
    get [Symbol.iterator]() {
        return this.map[Symbol.iterator];
    }
    get [Symbol.toStringTag]() {
        return this.map[Symbol.toStringTag];
    }
    clear(): void {
        this.cache.clear();
        return this.map.clear();
    }
    delete(key: K): boolean {
        const deleted = this.map.delete(key);
        if (deleted) {
            this.cache.delete(key);
        }
        return deleted;
    }
    get forEach() {
        return this.map.forEach;
    }
    get(key: K): V | undefined {
        const cachedValue = this.cache.get(key);
        if (cachedValue) {
            return cachedValue;
        }
        return this.map.get(key);
    }
    get has() {
        return this.map.has;
    }
    set(key: K, value: V): this {
        this.map.set(key, value);
        this.cache.set(key, value);
        return this;
    }
    get size() {
        return this.map.size;
    }
    get entries() {
        return this.map.entries;
    }
    get keys() {
        return this.map.keys;
    }
    get values() {
        return this.map.values;
    }
}
