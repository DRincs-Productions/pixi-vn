import { Rectangle } from "pixi.js";

export default class CanvasUtilitiesStatic {
    static init(options: { getScreen: () => Rectangle }) {
        CanvasUtilitiesStatic._getScreen = options.getScreen;
    }
    private static _getScreen: () => Rectangle;
    static get screen() {
        return CanvasUtilitiesStatic._getScreen();
    }
}
