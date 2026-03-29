import { PixiError } from "@drincs/pixi-vn/core";
import { logger } from "./log-utility";

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
        let elementString = JSON.stringify(element);
        return JSON.parse(elementString);
    } catch (e) {
        logger.error("Error creating exportable element", element, e);
        throw new PixiError("not_json_serializable", "Error creating exportable element");
    }
}
