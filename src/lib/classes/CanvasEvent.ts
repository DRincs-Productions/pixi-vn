type CanvasValidEventTypes = string | symbol | object;
export type CanvasEventTypes = string | symbol
type CanvasEventListener<
    T extends CanvasValidEventTypes,
    K extends CanvasEventNames<T>
> = T extends string | symbol
    ? (...args: any[]) => void
    : (
        ...args: CanvasArgumentMap<Exclude<T, string | symbol>>[Extract<K, keyof T>]
    ) => void;
export type CanvasEventNames<T extends CanvasValidEventTypes> = T extends string | symbol
    ? T
    : keyof T;
type CanvasArgumentMap<T extends object> = {
    [K in keyof T]: T[K] extends (...args: any[]) => void
    ? Parameters<T[K]>
    : T[K] extends any[]
    ? T[K]
    : any[];
};
export class CanvasEvent<T extends CanvasEventNames<CanvasEventTypes>> {
    fn: CanvasEventListener<CanvasEventTypes, T> = () => {
        throw new Error("This method should be overridden")
    };
}
