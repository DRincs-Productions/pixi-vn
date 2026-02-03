import type { Container as PixiContainer } from "@drincs/pixi-vn/pixi.js";
import CanvasBaseItem from "../classes/CanvasBaseItem";
import CanvasBaseItemMemory from "./memory/CanvasBaseItemMemory";

export interface CanvasBaseInterface<T2 extends CanvasBaseItemMemory> extends CanvasBaseItem<T2>, PixiContainer {}
