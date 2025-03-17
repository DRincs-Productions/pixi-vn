import { Container as PixiContainer } from "pixi.js";
import CanvasBaseItem from "../classes/CanvasBaseItem";

type ContainerChild = PixiContainer & CanvasBaseItem<any>;
export default ContainerChild;
