import { LabelJson } from "../classes";
import { saveLabel } from "../decorators/LabelDecorator";
import { LabelJsonType, StepLabelJsonType } from "../types";

/**
 * Import a Pixi'VN JSON to the system.
 * This feature was created to give other developers the ability to create tools that can generate Pixi'VN labels or that generate Pixi'VN after extracting information from a programming language designed for writing narratives.
 * @param data The Pixi'VN JSON to be imported
 * @returns
 */
export function importPixiVNJson(data: [LabelJsonType | string] | LabelJsonType | string) {
    if (Array.isArray(data)) {
        data.forEach((label) => {
            importPixiVNJson(label)
        })
        return
    }
    try {
        if (typeof data === "string") {
            data = JSON.parse(data)
        }
    }
    catch (e) {
        console.error("[Pixi'VN] Error parsing imported Pixi'VN JSON", e)
        return
    }
    if (typeof data !== "object") {
        console.error("[Pixi'VN] Error parsing imported Pixi'VN JSON: data is not an object")
        return
    }
    for (const labelId in data) {
        try {
            const steps: StepLabelJsonType[] = (data as any)[labelId]
            let label = new LabelJson(labelId, steps)
            saveLabel(label)
        }
        catch (e) {
            console.error(`[Pixi'VN] Error creating JSON label ${labelId}`, e)
        }
    }
}
