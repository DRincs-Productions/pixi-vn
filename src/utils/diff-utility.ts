import deepDiff from "deep-diff";
import { Difference } from "microdiff";
import { createExportableElement } from "./export-utility";
import { logger } from "./log-utility";

export function restoreDiffChanges<T extends object = object>(
    data: T,
    differences: deepDiff.Diff<T, T>[] | Difference[]
): T {
    let result = createExportableElement(data);
    if (differences.length > 1 && "type" in differences[0]) {
        differences = differences.reverse();
    }
    differences.forEach((diff) => {
        if ("type" in diff) {
            restoreMicroDiffChanges<T>(result, diff);
        } else {
            restoreDeepDiffChanges<T>(result, diff);
        }
    });
    return result;
}

function restoreMicroDiffChanges<T extends object = object>(result: T, diff: Difference) {
    let dataToEdit: any = result;
    if (diff.path && diff.path.length > 0) {
        diff.path.forEach((path, index) => {
            if (diff.path && index === diff.path.length - 1) {
                switch (diff.type) {
                    case "CHANGE":
                    case "REMOVE":
                        dataToEdit[path] = diff.oldValue;
                        break;
                    case "CREATE":
                        // if path is a number, dataToEdit is an array
                        if (Array.isArray(dataToEdit) && typeof path === "number") {
                            dataToEdit.splice(path, 1);
                        }
                        // if path is a string, dataToEdit is an object
                        else {
                            // remove key from object
                            delete dataToEdit[path];
                        }
                        break;
                }
            } else {
                dataToEdit = dataToEdit[path];
            }
        });
    } else {
        logger.warn("No path found, skipping diff", diff);
    }
}

/**
 * @deprecated This is the old implementation. will be removed in the future.
 */
function restoreDeepDiffChanges<T extends object = object>(result: T, diff: deepDiff.Diff<T, T>) {
    let dataToEdit: any = result;
    if (diff.path && diff.path.length > 0) {
        diff.path.forEach((path, index) => {
            if (diff.path && index === diff.path.length - 1) {
                if (diff.kind === "E" || diff.kind === "D") {
                    dataToEdit[path] = diff.lhs;
                } else if (diff.kind === "N") {
                    // if path is a number, dataToEdit is an array
                    if (Number.isInteger(path)) {
                        // remove index from array
                        if (Array.isArray(dataToEdit)) {
                            dataToEdit.splice(path, 1);
                        }
                    }
                    // if path is a string, dataToEdit is an object
                    else if (typeof path === "string") {
                        // remove key from object
                        delete dataToEdit[path];
                    }
                } else if (diff.kind === "A") {
                    let index = diff.index;
                    if (diff.item.kind === "N") {
                        // remove index from array
                        (dataToEdit[path] as any[]).splice(index, 1);
                    } else if (diff.item.kind === "E" || diff.item.kind === "D") {
                        // edit index in array
                        (dataToEdit[path] as any[])[index] = diff.item.lhs;
                    } else if (diff.item.kind === "A") {
                        logger.warn("Nested array found, skipping diff", diff);
                    } else {
                        logger.warn("No array found, skipping diff", diff);
                    }
                }
            } else {
                dataToEdit = dataToEdit[path];
            }
        });
    } else {
        logger.warn("No path found, skipping diff", diff);
    }
}
