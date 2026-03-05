import ErrorCodeType from "./ErrorCodeType";

export default class PixiError extends Error {
    public code: ErrorCodeType;

    constructor(code: ErrorCodeType, message: string) {
        super(message);
        this.code = code;
    }
}
