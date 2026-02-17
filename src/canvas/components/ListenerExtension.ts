import type { Container, PointData } from "@drincs/pixi-vn/pixi.js";

export interface ListenerExtensionProps {
    anchor?: PointData | number;
}

export default interface ListenerExtension {
    on: Container["on"];
}
