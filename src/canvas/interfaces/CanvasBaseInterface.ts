import type { Container as PixiContainer } from "@drincs/pixi-vn/pixi.js";
import type CanvasBaseItem from "../classes/CanvasBaseItem";
import type CanvasBaseItemMemory from "./memory/CanvasBaseItemMemory";

export interface CanvasBaseInterface<T2 extends CanvasBaseItemMemory>
    extends CanvasBaseItem<T2>,
        PixiContainer {}
