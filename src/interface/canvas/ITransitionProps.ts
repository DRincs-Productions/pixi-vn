import { FadeAlphaTickerProps, MoveTickerProps, ZoomTickerProps } from "../../types/ticker"
import { aliasToRemoveAfterType } from "../../types/ticker/AliasToRemoveAfterType"

export type ShowWithDissolveTransitionProps = Omit<FadeAlphaTickerProps, "type" | aliasToRemoveAfterType | "startOnlyIfHaveTexture">
export type ShowWithFadeTransitionProps = Omit<FadeAlphaTickerProps, "type" | aliasToRemoveAfterType | "startOnlyIfHaveTexture">
export type MoveInOutProps = {
    /**
     * The direction of the movement.
     */
    direction: "up" | "down" | "left" | "right",
} & Omit<MoveTickerProps, aliasToRemoveAfterType | "startOnlyIfHaveTexture" | "destination">
export type ZoomInOutProps = {
    /**
     * The direction of the zoom effect.
     */
    direction: "up" | "down" | "left" | "right",
} & Omit<ZoomTickerProps, aliasToRemoveAfterType | "startOnlyIfHaveTexture" | "type">
