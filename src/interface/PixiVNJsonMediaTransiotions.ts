import { UPDATE_PRIORITY } from "pixi.js"
import { MoveInOutProps, ShowWithDissolveTransitionProps, ShowWithFadeTransitionProps, ZoomInOutProps } from "../functions/canvas/CanvasTransition"

type DissolveTransition = {
    type: "dissolve"
    props?: ShowWithDissolveTransitionProps
    priority?: UPDATE_PRIORITY
}

type FadeTransition = {
    type: "fade"
    props?: ShowWithFadeTransitionProps
    priority?: UPDATE_PRIORITY
}

type MoveInOutTransition = {
    type: "movein" | "moveout"
    props?: MoveInOutProps
    priority?: UPDATE_PRIORITY
}

type ZoomInOut = {
    type: "zoomin" | "zoomout"
    props?: ZoomInOutProps
    priority?: UPDATE_PRIORITY
}

type PixiVNJsonMediaTransiotions = (DissolveTransition | FadeTransition | MoveInOutTransition | ZoomInOut)
export default PixiVNJsonMediaTransiotions
