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
