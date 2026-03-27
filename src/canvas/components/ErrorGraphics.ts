import { ContainerOptions, Graphics } from "@drincs/pixi-vn/pixi.js";
import CanvasBaseItem from "../classes/CanvasBaseItem";
import type CanvasBaseItemMemory from "../interfaces/memory/CanvasBaseItemMemory";

export default class ErrorGraphics<Memory extends CanvasBaseItemMemory>
    extends Graphics
    implements CanvasBaseItem<Memory>
{
    constructor(private readonly _memory: Memory | (Memory & ContainerOptions)) {
        super();
        this.pixivnId = _memory.pixivnId;
        if ("x" in _memory && typeof _memory.x === "number") {
            this.x = _memory.x;
        }
        if ("y" in _memory && typeof _memory.y === "number") {
            this.y = _memory.y;
        }
        if ("rotation" in _memory && typeof _memory.rotation === "number") {
            this.rotation = _memory.rotation;
        }
        if ("height" in _memory && typeof _memory.height === "number") {
            this.height = _memory.height;
        } else {
            this.height = 100;
        }
        if ("width" in _memory && typeof _memory.width === "number") {
            this.width = _memory.width;
        } else {
            this.width = 100;
        }
    }
    readonly pixivnId: string;
    get memory(): Memory {
        return this._memory;
    }
    async setMemory(value: Memory): Promise<void> {}
}
