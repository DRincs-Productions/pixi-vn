import { Sprite as PixiSprite } from 'pixi.js';
import { CanvasBaseItem, Container, ImageContainer, ImageSprite } from '../../classes';

export function checkIfTextureNotIsEmpty<T extends Container | CanvasBaseItem<any> = Container>(element: T) {
    if ((element instanceof ImageSprite || element instanceof ImageContainer) && element.haveEmptyTexture) {
        return false
    }
    else if (element instanceof PixiSprite && element.texture?.label == "EMPTY") {
        return false
    }
    return true
}
