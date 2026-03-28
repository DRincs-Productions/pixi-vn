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
        const x = "x" in _memory && typeof _memory.x === "number" ? _memory.x : 0;
        const y = "y" in _memory && typeof _memory.y === "number" ? _memory.y : 0;
        const height = "height" in _memory && typeof _memory.height === "number" ? _memory.height : 100;
        const width = "width" in _memory && typeof _memory.width === "number" ? _memory.width : 100;
        this.rect(0, 0, width - x, height - y);
        if ("rotation" in _memory && typeof _memory.rotation === "number") {
            this.rotation = _memory.rotation;
        }
        this.position.set(x, y);
    }
    readonly pixivnId: string;
    get memory(): Memory {
        return this._memory;
    }
    async setMemory(value: Memory): Promise<void> {}
}
