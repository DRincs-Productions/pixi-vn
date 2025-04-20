import { Sprite as PixiSprite } from "pixi.js";
import { CanvasBaseInterface } from "../classes/CanvasBaseItem";
import Container from "../components/Container";
import ImageContainer from "../components/ImageContainer";
import ImageSprite from "../components/ImageSprite";

export function checkIfTextureNotIsEmpty<T extends Container | CanvasBaseInterface<any> = Container>(element: T) {
    if ((element instanceof ImageSprite || element instanceof ImageContainer) && element.haveEmptyTexture) {
        return false;
    } else if (element instanceof PixiSprite && element.texture?.label == "EMPTY") {
        return false;
    }
    return true;
}
