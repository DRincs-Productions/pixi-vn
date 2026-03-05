import ErrorCodeType from "./ErrorCodeType";

export default class PixiError extends Error {
    public code: ErrorCodeType;

    constructor(code: ErrorCodeType, message: string) {
        super(`[Pixi’VN]  ${message}`);
        this.code = code;
    }
}
