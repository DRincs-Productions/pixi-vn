import { FadeAlphaTickerProps, MoveTickerProps, ZoomTickerProps } from "../../types/ticker"
import { aliasToRemoveAfterType } from "../../types/ticker/AliasToRemoveAfterType"

export interface ShowWithDissolveTransitionProps extends Omit<FadeAlphaTickerProps, "type" | aliasToRemoveAfterType | "startOnlyIfHaveTexture"> { }
export interface ShowWithFadeTransitionProps extends Omit<FadeAlphaTickerProps, "type" | aliasToRemoveAfterType | "startOnlyIfHaveTexture"> { }
export interface MoveInOutProps extends Omit<MoveTickerProps, aliasToRemoveAfterType | "startOnlyIfHaveTexture" | "destination" | "isPushInOut"> {
    /**
     * The direction of the movement.
     */
    direction?: "up" | "down" | "left" | "right",
}
export interface ZoomInOutProps extends Omit<ZoomTickerProps, "startOnlyIfHaveTexture" | "type" | "limit" | "isZoomInOut"> {
    /**
     * The direction of the zoom effect.
     */
    direction?: "up" | "down" | "left" | "right",
}
export interface PushInOutProps extends Omit<MoveTickerProps, "startOnlyIfHaveTexture" | "destination" | "isPushInOut"> {
    /**
     * The direction of the push effect.
     */
    direction?: "up" | "down" | "left" | "right",
} 
