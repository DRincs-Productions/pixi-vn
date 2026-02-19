import type { Container } from "@drincs/pixi-vn/pixi.js";
import { logger } from "../../utils/log-utility";
import RegisteredEvents, { SERIALIZABLE_EVENT } from "../decorators/event-decorator";

export interface ListenerExtensionMemory {
    onEvents?: OnEventsHandlers;
}

export interface OnEventsHandlers {
    [name: string]: string;
}

export default interface ListenerExtension {
    /**
     * Add a listener for a given event.
     * @example
     * ```ts
     * export class Events {
     *     \@eventDecorator()
     *     static eventExample(event: keyof AllFederatedEventMap, component: Sprite) {
     *         // event code here
     *     }
     * }
     *
     * sprite.on("pointerdown", Events.eventExample);
     * ```
     */
    on: Container["on"];
    readonly onEventsHandlers: OnEventsHandlers;
}

export async function setListenerMemory(
    element: (ListenerExtension | {}) & Container,
    memory: ListenerExtensionMemory | {},
) {
    if ("onEvents" in memory) {
        for (let event in memory.onEvents) {
            let id = memory.onEvents[event];
            let instance = RegisteredEvents.get(id);
            if (instance) {
                element.on(event, instance as (event: any, component: typeof element) => void);
            }
        }
    }
}

export function getListenerMemory<T extends ListenerExtension>(element: T | {}): Record<string, any> {
    return "onEventsHandlers" in element ? element.onEventsHandlers : {};
}

export function addListenerHandler<T extends ListenerExtension>(
    event: symbol | string,
    element: T,
    fn: Function,
): boolean {
    const handlerId = (fn as any)[SERIALIZABLE_EVENT] as string;

    if (handlerId && typeof handlerId === "string") {
        element.onEventsHandlers[event as string] = handlerId;
        return true;
    } else {
        logger.warn(
            `The event handler for event "${event as string}" is not registered with the eventDecorator, it will not be saved in the memory and it will not work after loading the game. Please register the event handler with the eventDecorator to avoid this warning. Read more about it here: https://pixi-vn.web.app/start/canvas-functions#add-a-listener-to-an-event`,
        );
        return false;
    }
}
