import { PixiError } from "@drincs/pixi-vn/core";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { canvas } from "..";
import type OnErrorHandler from "../../core/OnErrorHandler";
import ErrorGraphics from "../components/ErrorGraphics";

/**
 * Canvas error handler: when a `PixiError` contains `canvasElementInfo`,
 * draw a simple `ErrorGraphics` placeholder on the canvas so the scene
 * remains visible and debuggable.
 */
export function drawCanvasErrorHandler(): OnErrorHandler {
    const errorHandler: OnErrorHandler = async (error, props) => {
        try {
            if (error instanceof PixiError) {
                const info = (error as any).canvasElementInfo;
                if (info && info.pixivnId && "label" in info && typeof info.label === "string") {
                    const container = new ErrorGraphics(info);
                    // try to reuse zIndex if provided
                    const zIndex = (info as any).zIndex;
                    container.groupColor = 0xff0000;
                    const placeholder = new PIXI.Graphics();
                    placeholder.rect(-50, -200, 100, 200).fill({ color: 0xff0000, alpha: 0.5 });
                    container.addChild(placeholder);
                    const text = new PIXI.Text({ text: "error" });
                    container.addChild(text);
                    canvas.add(info.label, container, { zIndex });
                }
            }
        } catch (e) {}
    };
    return errorHandler;
}
