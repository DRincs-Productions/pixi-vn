import { Container as PixiContainer, PointData } from "pixi.js";

export interface AlignExtensionProps {
    /**
     * is a way to set the position of the element in the canvas. compared to position, align, it is a percentage used to determine the proximity from the edges of the canvas.
     * For example, if you set align to 0.5, the element will be in the center of the canvas.
     * If you set align to 0, the left end and a top end of the element will be in the left end and top end of the canvas.
     * If you set align to 1, the right end and a bottom end of the element will be in the right end and bottom end of the canvas.
     */
    align?: PointData | number
}

export default class AlignExtension extends PixiContainer {
    /**
     * is a way to set the position of the element in the canvas. compared to position, align, it is a percentage used to determine the proximity from the edges of the canvas.
     * For example, if you set align to 0.5, the element will be in the center of the canvas.
     * If you set align to 0, the left end and a top end of the element will be in the left end and top end of the canvas.
     * If you set align to 1, the right end and a bottom end of the element will be in the right end and bottom end of the canvas.
     */
    set align(_value: Partial<PointData> | number) {
        throw new Error("Method not implemented.");
    }
    /**
     * is a way to set the position of the element in the canvas. compared to position, align, it is a percentage used to determine the proximity from the edges of the canvas.
     * For example, if you set align to 0.5, the element will be in the center of the canvas.
     * If you set align to 0, the left end and a top end of the element will be in the left end and top end of the canvas.
     * If you set align to 1, the right end and a bottom end of the element will be in the right end and bottom end of the canvas.
     */
    set xAlign(_value: number) {
        throw new Error("Method not implemented.");
    }
    /**
     * is a way to set the position of the element in the canvas. compared to position, align, it is a percentage used to determine the proximity from the edges of the canvas.
     * For example, if you set align to 0.5, the element will be in the center of the canvas.
     * If you set align to 0, the left end and a top end of the element will be in the left end and top end of the canvas.
     * If you set align to 1, the right end and a bottom end of the element will be in the right end and bottom end of the canvas.
     */
    set yAlign(_value: number) {
        throw new Error("Method not implemented.");
    }
}
