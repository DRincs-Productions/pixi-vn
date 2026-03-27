import type { ContainerOptions } from "pixi.js";
import type { CanvasBaseItemMemory } from "../canvas";
import ErrorCodeType from "./ErrorCodeType";

export default class PixiError extends Error {
    public code: ErrorCodeType;
    constructor(code: ErrorCodeType, message: string);
    constructor(
        code: ErrorCodeType,
        message: string,
        type: "canvas",
        data: CanvasBaseItemMemory | (CanvasBaseItemMemory & ContainerOptions),
    );
    constructor(code: ErrorCodeType, message: string, type?: "canvas", data?: any) {
        super(`[Pixi’VN] ${message}`);
        this.code = code;
        switch (type) {
            case "canvas":
                this.canvasElementInfo = data;
                break;
        }
    }

    canvasElementInfo?: CanvasBaseItemMemory;
}
