import { Container as PixiContainer, PointData } from "pixi.js";

export interface AdditionalPositionsExtensionProps {
    /**
     * is a way to set the position of the element in the canvas. compared to position, align, it is a percentage used to determine the proximity from the edges of the canvas.
     * For example:
     * - if you set align to 0.5, the element will be in the center of the canvas.
     * - if you set align to 0, the left end and a top end of the element will be in the left end and top end of the canvas.
     * - if you set align to 1, the right end and a bottom end of the element will be in the right end and bottom end of the canvas.
     * 
     * **Important:** The {@link PixiContainer.pivot} field does not affect the alignment.
     */
    align?: Partial<PointData> | number
    /**
     * is a way to set the position of the element in the canvas. compared to position, align, it is a percentage used to determine the proximity from the edges of the canvas.
     * For example:
     * - if you set align to 0.5, the element will be in the center of the canvas.
     * - if you set align to 0, the left end and a top end of the element will be in the left end and top end of the canvas.
     * - if you set align to 1, the right end and a bottom end of the element will be in the right end and bottom end of the canvas.
     * 
     * **Important:** The {@link PixiContainer.pivot} field does not affect the alignment.
     */
    xAlign?: number
    /**
     * is a way to set the position of the element in the canvas. compared to position, align, it is a percentage used to determine the proximity from the edges of the canvas.
     * For example:
     * - if you set align to 0.5, the element will be in the center of the canvas.
     * - if you set align to 0, the left end and a top end of the element will be in the left end and top end of the canvas.
     * - if you set align to 1, the right end and a bottom end of the element will be in the right end and bottom end of the canvas.
     * 
     * **Important:** The {@link PixiContainer.pivot} field does not affect the alignment.
     */
    yAlign?: number
    /**
     * is a way to set the position of the element in the canvas calculated in percentage.
     * For example, if you set the {@link PixiContainer.pivot} to 0.5, and:
     * - if you set percentagePosition to 0.5, the element will be in the center of the canvas.
     * - If you set percentagePosition to 0, the center of the element will be in the left end and top end of the canvas.
     * - If you set percentagePosition to 1, the center of the element will be in the right end and bottom end of the canvas.
     * 
     * **Important:** The {@link PixiContainer.pivot} field does affect the percentagePosition.
     */
    percentagePosition?: Partial<PointData> | number
    /**
     * is a way to set the position of the element in the canvas calculated in percentage.
     * For example, if you set the {@link PixiContainer.pivot} to 0.5, and:
     * - if you set percentagePosition to 0.5, the element will be in the center of the canvas.
     * - If you set percentagePosition to 0, the center of the element will be in the left end and top end of the canvas.
     * - If you set percentagePosition to 1, the center of the element will be in the right end and bottom end of the canvas.
     * 
     * **Important:** The {@link PixiContainer.pivot} field does affect the percentagePosition.
     */
    xPercentagePosition?: number
    /**
     * is a way to set the position of the element in the canvas calculated in percentage.
     * For example, if you set the {@link PixiContainer.pivot} to 0.5, and:
     * - if you set percentagePosition to 0.5, the element will be in the center of the canvas.
     * - If you set percentagePosition to 0, the center of the element will be in the left end and top end of the canvas.
     * - If you set percentagePosition to 1, the center of the element will be in the right end and bottom end of the canvas.
     * 
     * **Important:** The {@link PixiContainer.pivot} field does affect the percentagePosition.
     */
    yPercentagePosition?: number
}

export default class AdditionalPositionsExtension extends PixiContainer {
    /**
     * is a way to set the position of the element in the canvas. compared to position, align, it is a percentage used to determine the proximity from the edges of the canvas.
     * For example:
     * - if you set align to 0.5, the element will be in the center of the canvas.
     * - if you set align to 0, the left end and a top end of the element will be in the left end and top end of the canvas.
     * - if you set align to 1, the right end and a bottom end of the element will be in the right end and bottom end of the canvas.
     * 
     * **Important:** The {@link PixiContainer.pivot} field does not affect the alignment.
     */
    set align(_value: Partial<PointData> | number) {
        throw new Error("Method not implemented.");
    }
    get align(): Partial<PointData> | number {
        throw new Error("Method not implemented.");
    }
    /**
     * is a way to set the position of the element in the canvas. compared to position, align, it is a percentage used to determine the proximity from the edges of the canvas.
     * For example:
     * - if you set align to 0.5, the element will be in the center of the canvas.
     * - if you set align to 0, the left end and a top end of the element will be in the left end and top end of the canvas.
     * - if you set align to 1, the right end and a bottom end of the element will be in the right end and bottom end of the canvas.
     * 
     * **Important:** The {@link PixiContainer.pivot} field does not affect the alignment.
     */
    set xAlign(_value: number) {
        throw new Error("Method not implemented.");
    }
    get xAlign(): number {
        throw new Error("Method not implemented.");
    }
    /**
     * is a way to set the position of the element in the canvas. compared to position, align, it is a percentage used to determine the proximity from the edges of the canvas.
     * For example:
     * - if you set align to 0.5, the element will be in the center of the canvas.
     * - if you set align to 0, the left end and a top end of the element will be in the left end and top end of the canvas.
     * - if you set align to 1, the right end and a bottom end of the element will be in the right end and bottom end of the canvas.
     * 
     * **Important:** The {@link PixiContainer.pivot} field does not affect the alignment.
     */
    set yAlign(_value: number) {
        throw new Error("Method not implemented.");
    }
    get yAlign(): number {
        throw new Error("Method not implemented.");
    }
    /**
     * is a way to set the position of the element in the canvas calculated in percentage.
     * For example, if you set the {@link PixiContainer.pivot} to 0.5, and:
     * - if you set percentagePosition to 0.5, the element will be in the center of the canvas.
     * - If you set percentagePosition to 0, the center of the element will be in the left end and top end of the canvas.
     * - If you set percentagePosition to 1, the center of the element will be in the right end and bottom end of the canvas.
     * 
     * **Important:** The {@link PixiContainer.pivot} field does affect the percentagePosition.
     */
    set percentagePosition(_value: Partial<PointData> | number) {
        throw new Error("Method not implemented.");
    }
    get percentagePosition(): Partial<PointData> | number {
        throw new Error("Method not implemented.");
    }
    /**
     * is a way to set the position of the element in the canvas calculated in percentage.
     * For example, if you set the {@link PixiContainer.pivot} to 0.5, and:
     * - if you set percentagePosition to 0.5, the element will be in the center of the canvas.
     * - If you set percentagePosition to 0, the center of the element will be in the left end and top end of the canvas.
     * - If you set percentagePosition to 1, the center of the element will be in the right end and bottom end of the canvas.
     * 
     * **Important:** The {@link PixiContainer.pivot} field does affect the percentagePosition.
     */
    set xPercentagePosition(_value: number) {
        throw new Error("Method not implemented.");
    }
    get xPercentagePosition(): number {
        throw new Error("Method not implemented.");
    }
    /**
     * is a way to set the position of the element in the canvas calculated in percentage.
     * For example, if you set the {@link PixiContainer.pivot} to 0.5, and:
     * - if you set percentagePosition to 0.5, the element will be in the center of the canvas.
     * - If you set percentagePosition to 0, the center of the element will be in the left end and top end of the canvas.
     * - If you set percentagePosition to 1, the center of the element will be in the right end and bottom end of the canvas.
     * 
     * **Important:** The {@link PixiContainer.pivot} field does affect the percentagePosition.
     */
    set yPercentagePosition(_value: number) {
        throw new Error("Method not implemented.");
    }
    get yPercentagePosition(): number {
        throw new Error("Method not implemented.");
    }
    get positionType(): "pixel" | "percentage" | "align" {
        throw new Error("Method not implemented.");
    }
    get positionInfo(): { x: number, y: number, type: "pixel" | "percentage" | "align" } {
        throw new Error("Method not implemented.");
    }
}

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
