import CachedMap from "@classes/CachedMap";
import type { Filter } from "@drincs/pixi-vn/pixi.js";
import { logger } from "@utils/log-utility";

/**
 * A dictionary that contains all filter classes registered and available to be used.
 */
const registeredFilters = new CachedMap<string, { new (args: any): Filter }>({ cacheSize: 5 });
/**
 * Per filter id, the function that reads a live filter instance's current parameters into a
 * serializable object. Required at registration time - unlike canvas components/tickers, a PixiJS
 * `Filter` (including third-party ones like the built-in `BlurFilter`, which Pixi'VN doesn't control)
 * has no common way to read its own construction options back out, so there's no sensible default.
 */
const registeredFilterToMemory = new CachedMap<string, (filter: any) => any>({ cacheSize: 5 });

/**
 * Is a decorator that registers a `Filter` class so it can be saved and restored as part of a canvas
 * element's `.filters`. Required for any custom filter you want to survive a save/restore round-trip -
 * built-in ones like `PixelateFilter` (and `BlurFilter`) are already registered by Pixi'VN.
 * @param options.name The id used to identify this filter class in saves (must be unique). Defaults to the class name.
 * @param options.toMemory Reads a live instance's current parameters into a plain, serializable object. It is passed to the class's constructor (as its single argument) to reconstruct the filter on restore.
 * @example
 * ```ts
 * @filterDecorator({ toMemory: (filter: MyFilter) => ({ amount: filter.amount }) })
 * class MyFilter extends Filter {
 *     constructor(args: { amount?: number } = {}) {
 *         super({ ... });
 *         this.amount = args.amount ?? 0;
 *     }
 *     // ...
 * }
 * ```
 */
export function filterDecorator<T extends { new (args: any): Filter }>(options: {
    name?: string;
    toMemory: (filter: InstanceType<T>) => any;
}) {
    return (target: T) => {
        RegisteredFilters.add(target, options);
    };
}

namespace RegisteredFilters {
    /**
     * Register a filter class in the game.
     * @param target The class of the filter. Must be constructible from a single, serializable `args` object.
     * @param options.name Name of the filter, by default it will use the class name. If the name is already registered, it will show a warning
     * @param options.toMemory Reads a live instance's current parameters into a plain, serializable object.
     */
    export function add<T extends { new (args: any): Filter }>(
        target: T,
        options: {
            name?: string;
            toMemory: (filter: InstanceType<T>) => any;
        },
    ) {
        const { toMemory } = options;
        const name = options.name ?? target.name;
        if (registeredFilters.get(name)) {
            logger.info(`Filter "${name}" already exists, it will be overwritten`);
        }
        target.prototype.pixivnFilterId = name;
        registeredFilters.set(name, target);
        registeredFilterToMemory.set(name, toMemory);
    }

    /**
     * Get a filter class by the id.
     * @param filterId The id of the filter.
     * @returns The filter class.
     */
    export function get<T = { new (args: any): Filter }>(filterId: string): T | undefined {
        const filterType = registeredFilters.get(filterId);
        if (!filterType) {
            logger.error(
                `Filter "${filterId}" not found, did you forget to register it with the filterDecorator?`,
            );
            return;
        }
        return filterType as T;
    }

    /**
     * Get a filter instance by the id, reconstructed from previously saved `args`.
     * @param filterId The id of the filter.
     * @param args The arguments to pass to the filter's constructor, as produced by a previous `toMemory` call.
     * @returns The filter instance, or `undefined` if the filter isn't registered or construction failed.
     */
    export function getInstance(filterId: string, args: any): Filter | undefined {
        const filterType = get(filterId);
        if (!filterType) {
            return;
        }
        try {
            return new (filterType as { new (args: any): Filter })(args);
        } catch (e) {
            logger.error(`Error while getting Filter instance "${filterId}"`, e);
            return;
        }
    }

    /**
     * Reads a live filter instance's current parameters into a serializable {@link FilterMemory}, using
     * the `toMemory` function it was registered with.
     * @param filterId The id the filter was registered under (readable on any instance as `filter.pixivnFilterId`).
     * @param filter The live filter instance.
     * @returns The memory object, or `undefined` if the filter isn't registered or conversion failed.
     */
    export function toMemory(
        filterId: string,
        filter: Filter,
    ): { filterId: string; args: any } | undefined {
        const toMemoryFn = registeredFilterToMemory.get(filterId);
        if (!toMemoryFn) {
            logger.error(
                `Filter "${filterId}" not found, did you forget to register it with the filterDecorator?`,
            );
            return;
        }
        try {
            return { filterId, args: toMemoryFn(filter) };
        } catch (e) {
            logger.error(`Error while converting Filter "${filterId}" to memory`, e);
            return;
        }
    }

    /**
     * Get a list of all filter classes registered.
     * @returns An array of filter classes.
     */
    export function values(): { new (args: any): Filter }[] {
        return Array.from(registeredFilters.values());
    }

    /**
     * Check if a filter is registered.
     * @param id The id of the filter.
     * @returns True if the filter is registered, false otherwise.
     */
    export function has(id: string): boolean {
        return registeredFilters.has(id);
    }

    /**
     * Get a list of all filter ids registered.
     * @returns An array of filter ids.
     */
    export function keys(): string[] {
        return Array.from(registeredFilters.keys());
    }
}
export default RegisteredFilters;
