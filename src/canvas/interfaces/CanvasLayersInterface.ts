import type { Container as PixiContainer } from "@drincs/pixi-vn/pixi.js";
import type Layer from "../components/Layer";

export default interface CanvasLayersInterface {
    /**
     * The PIXI Container that contains all the canvas elements.
     */
    readonly gameLayer: PixiContainer;
    /**
     * Add a layer to the canvas.
     * @param label The label of the layer.
     * @param layer The layer to be added.
     * @returns The layer.
     * @example
     * ```ts
     * const uiLayer = new Container();
     * canvas.layers.add("ui", uiLayer);
     * ```
     */
    add(label: string, layer: PixiContainer): Layer | undefined;
    /**
     * Get a layer from the canvas.
     * @param label The label of the layer.
     * @returns The layer.
     * @example
     * ```ts
     * const uiLayer = canvas.layers.get("ui");
     * ```
     */
    get(label: string): Layer | null;
    /**
     * Remove a layer from the canvas.
     * @param label The label of the layer to be removed.
     * @example
     * ```ts
     * canvas.layers.remove("ui");
     * ```
     */
    remove(label: string): void;
}
