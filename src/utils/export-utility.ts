import { PixiError } from "@drincs/pixi-vn/core";
import { logger } from "@utils/log-utility";

/**
 * This function is used to create a deep copy of the element
 * @param element The element to be copied
 * @returns The copied element
 * @throws {PixiError} when the element is not JSON serializable (e.g. contains functions or class instances).
 */
export function createExportableElement<T>(element: T): T {
    try {
        if (typeof element === "undefined") {
            return element;
        }
        const elementString = JSON.stringify(element);
        return JSON.parse(elementString);
    } catch (e) {
        logger.error("Error creating exportable element", element, e);
        throw new PixiError("not_json_serializable", "Error creating exportable element");
    }
}

/**
 * This function is used to convert a Map to an Object recursively. It is used to convert the history data to an exportable format.
 */
export function mapToObjectRecursive<K extends string, V>(map: Map<K, V>): Record<K, V> {
    const result: Record<K, V> = {} as Record<K, V>;
    for (const [key, value] of map.entries()) {
        if (value instanceof Map) {
            result[key] = mapToObjectRecursive(
                value as unknown as Map<string, unknown>,
            ) as unknown as V;
        } else {
            result[key] = value;
        }
    }
    return result;
}
