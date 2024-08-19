import { saveLabel } from "../../decorators/LabelDecorator";
import LabelJson from "../classes/LabelJson";
import PixiVNJson from "../types/PixiVNJson";
import PixiVNJsonLabelStep from "../types/PixiVNJsonLabelStep";

/**
 * Import a Pixi'VN JSON to the system.
 * This feature was created to give other developers the ability to create tools that can generate Pixi'VN labels or that generate Pixi'VN after extracting information from a programming language designed for writing narratives.
 * @param data The Pixi'VN JSON to be imported
 * @returns
 */
export function importPixiVNJson(data: PixiVNJson | string) {
    try {
        if (typeof data === "string") {
            data = JSON.parse(data) as PixiVNJson
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
    if (data.labels) {
        let labels = data.labels
        for (const labelId in labels) {
            try {
                const steps: PixiVNJsonLabelStep[] = labels[labelId]
                let label = new LabelJson(labelId, steps)
                saveLabel(label)
            }
            catch (e) {
                console.error(`[Pixi'VN] Error creating JSON label ${labelId}`, e)
            }
        }
    }
}
