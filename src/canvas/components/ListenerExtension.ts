import type { Container, PointData } from "@drincs/pixi-vn/pixi.js";

export interface ListenerExtensionProps {
    anchor?: PointData | number;
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
    readonly onEventsHandlers: { [name: string]: string };
}
