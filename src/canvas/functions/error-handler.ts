import { PixiError } from "@drincs/pixi-vn/core";
import { canvas } from "..";
import type OnErrorHandler from "../../core/OnErrorHandler";
import ErrorGraphics from "../components/ErrorGraphics";

/**
 * Canvas error handler: when a `PixiError` contains `canvasElementInfo`,
 * draw a simple `ErrorGraphics` placeholder on the canvas so the scene
 * remains visible and debuggable.
 */
export const errorHandler: OnErrorHandler = async (error, props) => {
    try {
        if (error instanceof PixiError) {
            const info = (error as any).canvasElementInfo;
            if (info && info.pixivnId && "label" in info && typeof info.label === "string") {
                const component = new ErrorGraphics(info);
                // try to reuse zIndex if provided
                const zIndex = (info as any).zIndex;
                canvas.add(info.label, component, { zIndex });
            }
        }
    } catch (e) {}
};
