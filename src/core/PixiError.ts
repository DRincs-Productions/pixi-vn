import type { CanvasBaseItemMemory } from "@canvas/index";
import type { ErrorCodeType } from "@core/ErrorCodeType";
import type { CanvasBaseItem } from "@drincs/pixi-vn/canvas";
import type { ContainerOptions } from "pixi.js";

export default class PixiError extends Error {
    public code: ErrorCodeType;
    constructor(code: ErrorCodeType, message: string);
    constructor(
        code: ErrorCodeType,
        message: string,
        type: "canvas",
        data: CanvasBaseItemMemory | (CanvasBaseItemMemory & ContainerOptions),
        parent?: CanvasBaseItem<any>,
    );
    constructor(
        code: ErrorCodeType,
        message: string,
        type?: "canvas",
        data?: any,
        parent?: CanvasBaseItem<any>,
    ) {
        super(`[Pixi’VN] ${message}`);
        this.code = code;
        switch (type) {
            case "canvas":
                this.canvasElementInfo = data;
                this.parent = parent;
                break;
        }
    }

    canvasElementInfo?: CanvasBaseItemMemory;
    parent?: CanvasBaseItem<any>;
}
