import deepDiff from "deep-diff"
import { createExportableElement } from "./export-utility"

export function restoreDeepDiffChanges<T extends object = object>(data: T, differences: deepDiff.Diff<T, T>[]): T {
    let result = createExportableElement(data)
    differences.forEach((diff) => {
        let dataToEdit: any = result
        if (diff.path && diff.path.length > 0) {
            diff.path.forEach((path, index) => {
                if (diff.path && index === diff.path.length - 1) {
                    if (diff.kind === "E" || diff.kind === "D") {
                        dataToEdit[path] = diff.lhs
                    }
                    else if (diff.kind === "N") {
                        // if path is a number, dataToEdit is an array
                        if (Number.isInteger(path)) {
                            // remove index from array
                            if (Array.isArray(dataToEdit)) {
                                dataToEdit.splice(path, 1)
                            }
                        }
                        // if path is a string, dataToEdit is an object
                        else if (typeof path === "string") {
                            // remove key from object
                            delete dataToEdit[path]
                        }
                    }
                    else if (diff.kind === "A") {
                        let index = diff.index
                        if (diff.item.kind === "N") {
                            // remove index from array
                            (dataToEdit[path] as any[]).splice(index, 1)
                        }
                        else if (diff.item.kind === "E" || diff.item.kind === "D") {
                            // edit index in array
                            (dataToEdit[path] as any[])[index] = diff.item.lhs
                        }
                        else if (diff.item.kind === "A") {
                            console.warn("[Pixi’VN] Nested array found, skipping diff", diff)
                        }
                        else {
                            console.warn("[Pixi’VN] No array found, skipping diff", diff)
                        }
                    }
                }
                else {
                    dataToEdit = dataToEdit[path]
                }
            })
        }
        else {
            console.warn("[Pixi’VN] No path found, skipping diff", diff)
        }
    })
    return result
}