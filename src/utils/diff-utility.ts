import { Difference } from "microdiff";
import { createExportableElement } from "./export-utility";
import { logger } from "./log-utility";

export function restoreDiffChanges<T extends object = object>(data: T, differences: Difference[]): T {
    let result = createExportableElement(data);
    if (differences.length > 1 && "type" in differences[0]) {
        differences = differences.reverse();
    }
    differences.forEach((diff) => {
        restoreMicroDiffChanges<T>(result, diff);
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
