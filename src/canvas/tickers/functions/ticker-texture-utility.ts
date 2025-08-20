import { Sprite as PixiSprite } from "@drincs/pixi-vn/pixi.js";
import Container from "../../components/Container";
import ImageContainer from "../../components/ImageContainer";
import ImageSprite from "../../components/ImageSprite";
import { CanvasBaseInterface } from "../../interfaces/CanvasBaseInterface";

export function checkIfTextureNotIsEmpty<T extends Container | CanvasBaseInterface<any> = Container>(element: T) {
    if ((element instanceof ImageSprite || element instanceof ImageContainer) && element.haveEmptyTexture) {
        return false;
    } else if (element instanceof PixiSprite && element.texture?.label == "EMPTY") {
        return false;
    }
    return true;
}
