import { Container as PixiContainer } from "pixi.js";
import CanvasBaseItem from "../canvas/classes/CanvasBaseItem";

type ContainerChild = PixiContainer & CanvasBaseItem<any>;
export default ContainerChild;
