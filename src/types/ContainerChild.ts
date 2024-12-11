import { Container as PixiContainer } from "pixi.js";
import CanvasBaseItem from "../classes/canvas/CanvasBaseItem";

type ContainerChild = PixiContainer & CanvasBaseItem<any>
export default ContainerChild
