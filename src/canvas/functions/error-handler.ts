import type { OnErrorHandler } from "@drincs/pixi-vn/core";
import type { PixiError } from "@drincs/pixi-vn/core";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { canvas } from "..";
import ErrorContainer from "../components/ErrorContainer";

/**
 * Canvas error handler: when a `PixiError` contains `canvasElementInfo`,
 * draw a simple `ErrorGraphics` placeholder on the canvas so the scene
 * remains visible and debuggable.
 */
export function drawCanvasErrorHandler(): OnErrorHandler {
    const errorHandler: OnErrorHandler = async (error, props) => {
        try {
            const info = (error as PixiError).canvasElementInfo;
            if (info) {
                const container = new ErrorContainer(info);
                // try to reuse zIndex if provided
                const zIndex = (info as any).zIndex;
                container.groupColor = 0xff0000;
                const placeholder = new PIXI.Graphics();
                placeholder.rect(0, 0, 300, 100).fill({ color: 0xff0000, alpha: 0.5 });
                container.addChild(placeholder);
                const text = new PIXI.Text({ text: `Error: ${info.label}`, x: 10, y: 10 });
                container.addChild(text);
                const ppparent = (error as PixiError).parent;
                if (ppparent && "addChild" in ppparent) {
                    if (zIndex !== undefined) {
                        (ppparent as any).addChildAt(container, zIndex);
                    } else {
                        (ppparent as any).addChild(container);
                    }
                } else {
                    const parent = info.parentLabel ? canvas.find(info.parentLabel) : undefined;
                    if (parent) {
                        if (zIndex !== undefined) {
                            parent.addChildAt(container, zIndex);
                        } else {
                            parent.addChild(container);
                        }
                    } else {
                        const alias = info.label ?? info.pixivnId;
                        canvas.add(alias, container, { zIndex });
                    }
                }
            }
        } catch (e) {}
    };
    return errorHandler;
}
