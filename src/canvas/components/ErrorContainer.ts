import type { ContainerOptions } from "@drincs/pixi-vn/pixi.js";
import { Container } from "..";
import type CanvasBaseItemMemory from "../interfaces/memory/CanvasBaseItemMemory";

export default class ErrorContainer<Memory extends CanvasBaseItemMemory> extends Container<any> {
    constructor(private readonly _memory: Memory | (Memory & ContainerOptions)) {
        super(_memory);
        this.pixivnId = _memory.pixivnId;
    }
    override pixivnId: string;
    override get memory(): any {
        return {
            ...this._memory,
            ...super.memory,
            elements: [],
            pixivnId: this.pixivnId,
        };
    }
}
