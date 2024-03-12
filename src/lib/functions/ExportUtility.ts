export function createExportElement<T>(element: T): T {
    try {
        let elementString = JSON.stringify(element)
        return JSON.parse(elementString)
    }
    catch (e) {
        throw new Error("The element could not be created")
    }
}
