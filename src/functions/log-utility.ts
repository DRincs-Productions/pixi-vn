export namespace logger {
    export const log = (message?: any, ...optionalParams: any[]) =>
        console.log(`[Pixi’VN] ${message}`, ...optionalParams);
    export const warn = (message?: any, ...optionalParams: any[]) =>
        console.warn(`[Pixi’VN] ${message}`, ...optionalParams);
    export const error = (message?: any, ...optionalParams: any[]) =>
        console.error(`[Pixi’VN] ${message}`, ...optionalParams);
}
