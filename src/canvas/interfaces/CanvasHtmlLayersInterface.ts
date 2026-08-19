export default interface CanvasHtmlLayersInterface {
    /**
     * Add a HTML layer to the canvas.
     * @param id The id of the layer.
     * @param element The html element to be added.
     * @param style The style of the layer. @default { position: "absolute", pointerEvents: "none", userSelect: "none" }.
     * @example
     * ```tsx
     * const root = document.getElementById('root')
     * if (!root) {
     *     throw new Error('root element not found')
     * }
     * const htmlLayer = canvas.htmlLayers.add("ui", root, {
     *    position: "absolute",
     *    pointerEvents: "none"
     * })
     * const reactRoot = createRoot(htmlLayer)
     * reactRoot.render(
     *     <App />
     * )
     * ```
     */
    add(
        id: string,
        element: HTMLElement,
        style?: Partial<Pick<CSSStyleDeclaration, "position" | "pointerEvents" | "userSelect">>,
    ): HTMLDivElement;
    /**
     * Get a HTML layer from the canvas.
     * @param id The id of the layer.
     */
    get(id: string): HTMLElement | undefined;
    /**
     * Remove a HTML layer from the canvas.
     * @param id The id of the layer to be removed.
     */
    remove(id: string): void;
}
