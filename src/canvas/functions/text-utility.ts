import { canvas, Text, TextOptions } from "..";

/**
 * Add and show a text in the canvas.
 * @param alias The unique alias of the text. You can use this alias to refer to this text.
 * @param text
 * @param options The options of the text.
 * @returns A promise that is resolved when the text is loaded.
 * @example
 * ```typescript
 * let text = showText("text", "Hello World", { fontSize: 24, fill: "white" })
 * ```
 */
export function showText(alias: string, text: string, options?: Omit<TextOptions, "text">): Text {
    let oldMemory = { ...canvas.find(alias)?.memory, ...options };
    let component = new Text({
        text,
        ...options,
    });
    if (oldMemory) {
        canvas.copyCanvasElementProperty(oldMemory, component);
    }
    canvas.add(alias, component, { ignoreOldStyle: true });
    return component;
}
