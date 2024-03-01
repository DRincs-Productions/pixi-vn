type ValidEventTypes = string | symbol | object;
type EventTypes = string | symbol
type EventListener<
    T extends ValidEventTypes,
    K extends EventNames<T>
> = T extends string | symbol
    ? (...args: any[]) => void
    : (
        ...args: ArgumentMap<Exclude<T, string | symbol>>[Extract<K, keyof T>]
    ) => void;
type EventNames<T extends ValidEventTypes> = T extends string | symbol
    ? T
    : keyof T;
type ArgumentMap<T extends object> = {
    [K in keyof T]: T[K] extends (...args: any[]) => void
    ? Parameters<T[K]>
    : T[K] extends any[]
    ? T[K]
    : any[];
};
export class CanvasOnEvent {
    on<T extends EventNames<EventTypes>>(
        _event: T,
        _fn: EventListener<EventTypes, T>,
    ): this {
        return this
    }
}
