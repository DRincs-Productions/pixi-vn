import type { Container as PixiContainer } from "@drincs/pixi-vn/pixi.js";
import type CanvasBaseItem from "../classes/CanvasBaseItem";

type ContainerChild = PixiContainer & CanvasBaseItem<any>;
export default ContainerChild;
