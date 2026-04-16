import type { Rectangle } from "@drincs/pixi-vn/pixi.js";

let _getScreen: () => Rectangle;

namespace CanvasUtilitiesStatic {
    export function init(options: { getScreen: () => Rectangle }) {
        _getScreen = options.getScreen;
    }
    export function screen(): Rectangle {
        return _getScreen();
    }
}
export default CanvasUtilitiesStatic;
