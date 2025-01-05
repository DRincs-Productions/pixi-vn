import { Container as PixiContainer } from "pixi.js"
import { canvas } from "../.."
import { AdditionalPositionsExtensionProps } from "../../classes/canvas/AdditionalPositions"

export function analizePositionsExtensionProps<T extends AdditionalPositionsExtensionProps>(props?: T): T | undefined {
    if (!props) {
        return props
    }
    if (typeof props.align !== "number") {
        if (props.xAlign != undefined) {
            if (props.align === undefined) {
                props.align = { x: props.xAlign }
                delete props.xAlign
            }
            else {
                props.align.x = props.xAlign
                delete props.xAlign
            }
        }
        if (props.yAlign != undefined) {
            if (props.align === undefined) {
                props.align = { y: props.yAlign }
                delete props.yAlign
            }
            else {
                props.align.y = props.yAlign
                delete props.yAlign
            }
        }
    }
    if (typeof props.percentagePosition !== "number") {
        if (props.xPercentagePosition != undefined) {
            if (props.percentagePosition === undefined) {
                props.percentagePosition = { x: props.xPercentagePosition }
                delete props.xPercentagePosition
            }
            else {
                props.percentagePosition.x = props.xPercentagePosition
                delete props.xPercentagePosition
            }
        }
        if (props.yPercentagePosition != undefined) {
            if (props.percentagePosition === undefined) {
                props.percentagePosition = { y: props.yPercentagePosition }
                delete props.yPercentagePosition
            }
            else {
                props.percentagePosition.y = props.yPercentagePosition
                delete props.yPercentagePosition
            }
        }
    }
    return props
}

export function calculatePositionByAlign(type: "width" | "height", align: number, width: number, pivot: number, anchor: number = 0): number {
    if (type === "width") {
        return (align * (canvas.screen.width - width)) + pivot + (anchor * width)
    }
    else {
        return (align * (canvas.screen.height - width)) + pivot + (anchor * width)
    }
}

export function calculateAlignByPosition(type: "width" | "height", position: number, width: number, pivot: number, anchor: number = 0): number {
    if (type === "width") {
        return ((position - pivot - (anchor * width)) / (canvas.screen.width - width))
    }
    else {
        return ((position - pivot - (anchor * width)) / (canvas.screen.height - width))
    }
}

export function calculatePositionByPercentagePosition(type: "width" | "height", percentage: number) {
    if (type === "width") {
        return percentage * canvas.screen.width
    }
    else {
        return percentage * canvas.screen.height
    }
}

export function calculatePercentagePositionByPosition(type: "width" | "height", position: number) {
    if (type === "width") {
        return position / canvas.screen.width
    }
    else {
        return position / canvas.screen.height
    }
}

export function getSuperPivot(canvasElement: PixiContainer): { x: number, y: number } {
    let angle = canvasElement.angle % 360
    if (angle < 0) {
        angle += 360
    }
    if (angle === 0) {
        return { x: canvasElement.pivot.x, y: canvasElement.pivot.y }
    }
    else if (angle === 90) {
        return { x: - canvasElement.pivot.y, y: canvasElement.pivot.x }
    }
    else if (angle === 180) {
        return { x: - canvasElement.pivot.x, y: - canvasElement.pivot.y }
    }
    else if (angle === 270) {
        return { x: canvasElement.pivot.y, y: - canvasElement.pivot.x }
    }
    else if (angle > 0 && angle < 90) {
        let angleRad = angle * Math.PI / 180
        let cos = Math.cos(angleRad)
        let sin = Math.sin(angleRad)
        return {
            x: canvasElement.pivot.x * cos - canvasElement.pivot.y * sin,
            y: canvasElement.pivot.x * sin + canvasElement.pivot.y * cos
        }
    }
    else if (angle > 90 && angle < 180) {
        let angleRad = (angle - 90) * Math.PI / 180
        let cos = Math.cos(angleRad)
        let sin = Math.sin(angleRad)
        return {
            x: - canvasElement.pivot.y * sin - canvasElement.pivot.x * cos,
            y: canvasElement.pivot.y * cos - canvasElement.pivot.x * sin
        }
    }
    else if (angle > 180 && angle < 270) {
        let angleRad = (angle - 180) * Math.PI / 180
        let cos = Math.cos(angleRad)
        let sin = Math.sin(angleRad)
        return {
            x: - canvasElement.pivot.x * cos + canvasElement.pivot.y * sin,
            y: - canvasElement.pivot.x * sin - canvasElement.pivot.y * cos
        }
    }
    else if (angle > 270 && angle < 360) {
        let angleRad = (angle - 270) * Math.PI / 180
        let cos = Math.cos(angleRad)
        let sin = Math.sin(angleRad)
        return {
            x: canvasElement.pivot.y * sin - canvasElement.pivot.x * cos,
            y: - canvasElement.pivot.y * cos - canvasElement.pivot.x * sin
        }
    }
    return { x: 0, y: 0 }
}
