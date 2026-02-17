import type { Container } from "@drincs/pixi-vn/pixi.js";
import RegisteredEvents from "../decorators/event-decorator";

export interface ListenerExtensionProps {
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
     * \@eventDecorator()
     * function eventExample(event: AllFederatedEventMap, component: Sprite) {
     *     // event code here
     * }
     *
     * sprite.on("pointerdown", eventExample);
     * ```
     */
    on: Container["on"];
    readonly onEventsHandlers: OnEventsHandlers;
}

export async function setListenerMemory(element: ListenerExtension, memory: ListenerExtensionProps | {}) {
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
