import type { Container as PixiContainer } from "@drincs/pixi-vn/pixi.js";
import CanvasBaseItem from "../classes/CanvasBaseItem";

type ContainerChild = PixiContainer & CanvasBaseItem<any>;
export default ContainerChild;
