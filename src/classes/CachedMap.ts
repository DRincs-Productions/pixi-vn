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
    [Symbol.iterator](): MapIterator<[K, V]> {
        return this.map[Symbol.iterator]();
    }
    get [Symbol.toStringTag](): string {
        return this.map[Symbol.toStringTag];
    }
    clear(): void {
        this.cache.clear();
        this.map.clear();
    }
    delete(key: K): boolean {
        const deleted = this.map.delete(key);
        if (deleted) {
            this.cache.delete(key);
        }
        return deleted;
    }
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        throw new Error("Method not implemented.");
    }
    get(key: K): V | undefined {
        const cachedValue = this.cache.get(key);
        if (cachedValue) {
            return cachedValue;
        }
        return this.map.get(key);
    }
    has(key: K): boolean {
        return this.map.has(key);
    }
    set(key: K, value: V): this {
        this.map.set(key, value);
        this.cache.set(key, value);
        return this;
    }
    get size(): number {
        return this.map.size;
    }
    entries(): MapIterator<[K, V]> {
        return this.map.entries();
    }
    keys(): MapIterator<K> {
        return this.map.keys();
    }
    values(): MapIterator<V> {
        return this.map.values();
    }
}
