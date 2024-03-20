/**
 * This function is used to create a deep copy of the element
 * @param element The element to be copied
 * @returns The copied element
 */
export function createExportElement<T>(element: T): T {
    try {
        let elementString = JSON.stringify(element)
        return JSON.parse(elementString)
    }
    catch (e) {
        throw new Error("[Pixi'VM] The element could not be created")
    }
}
