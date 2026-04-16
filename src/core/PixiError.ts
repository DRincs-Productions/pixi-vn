import type { ContainerOptions } from "pixi.js";
import type { CanvasBaseItem, CanvasBaseItemMemory } from "../canvas";
import type ErrorCodeType from "./ErrorCodeType";

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
