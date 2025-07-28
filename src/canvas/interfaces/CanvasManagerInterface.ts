import { Devtools } from "@pixi/devtools";
import { AnimationOptions, ObjectTarget } from "motion";
import { Application, ApplicationOptions, ContainerChild, Container as PixiContainer, Rectangle } from "pixi.js";
import { CommonTickerProps, Ticker, TickerArgs, TickerInfo, TickersSequence } from "../tickers";
import PauseTickerType from "../types/PauseTickerType";
import { PauseType } from "../types/PauseType";
import { RepeatType } from "../types/RepeatType";
import { CanvasBaseInterface } from "./CanvasBaseInterface";
import CanvasGameState from "./CanvasGameState";
import CanvasBaseItemMemory from "./memory/CanvasBaseItemMemory";

export default interface CanvasManagerInterface {
    /**
     * The PIXI Application instance.
     * It not recommended to use this property directly.
     */
    readonly app: Application;
    /**
     * The PIXI Container that contains all the canvas elements.
     *
     */
    readonly gameLayer: PixiContainer;
    /**
     * If the manager is initialized.
     */
    readonly isInitialized: boolean;
    /**
     * @deprecated Use `canvas.getHtmlLayers` instead.
     */
    get htmlLayout(): HTMLElement | undefined;
    /**
     * @deprecated Use `canvas.addHtmlLayer` instead.
     */
    set htmlLayout(value: HTMLElement);
    /**
     * The width of the canvas.
     */
    canvasWidth: number;
    /**
     * The height of the canvas.
     */
    canvasHeight: number;
    /**
     * The screen of the canvas ({@link Application.screen}).
     */
    readonly screen: Rectangle;
    /**
     * Initialize the PixiJS Application and the interface div.
     * This method should be called before any other method.
     * @param element The html element where I will put the canvas. Example: document.body
     * @param width The width of the canvas
     * @param height The height of the canvas
     * @param options The options of PixiJS Application
     * @param devtoolsOptions The options of the devtools. You can read more about it in the [PixiJS Devtools documentation](https://pixijs.io/devtools/docs/plugin/)
     * @example
     * ```typescript
     * const body = document.body
     * if (!body) {
     *     throw new Error('body element not found')
     * }
     * await canvas.init(body, {
     *     width: 1920,
     *     height: 1080,
     *     backgroundColor: "#303030"
     * })
     * ```
     */
    init(
        element: HTMLElement,
        options: Partial<ApplicationOptions> & { width: number; height: number },
        devtoolsOptions?: Devtools
    ): Promise<void>;
    /**
     * @deprecated Use `canvas.addHtmlLayer` instead.
     */
    initializeHTMLLayout(element: HTMLElement): void;
    /**
     * The children of the canvas.
     */
    readonly children: ContainerChild[];
    /**
     * Copy the properties of an old canvas element to a new canvas element.
     * @param oldAlias Old alias
     * @param newAlias New alias
     * @returns
     */
    copyCanvasElementProperty<T extends CanvasBaseItemMemory>(
        oldAlias: T | CanvasBaseInterface<T> | string,
        newAlias: CanvasBaseInterface<T> | string
    ): Promise<void>;

    /**
     * Transfer the tickers from an old alias to a new alias.
     * @param oldAlias Old alias
     * @param newAlias New alias
     * @param mode If "move", the old alias will be removed from the ticker. If "duplicate", the old alias will be kept in the ticker.
     */
    transferTickers(oldAlias: string, newAlias: string, mode?: "move" | "duplicate"): void;
    /**
     * Add a canvas element to the canvas.
     * If there is a canvas element with the same alias, all "style", zIndex, and {@link TickerBase} will be transferred to the new canvas element,
     * and the old canvas element will be removed.
     * @param alias The alias of the canvas element.
     * @param canvasComponent The canvas elements to be added.
     * @param options The options of the canvas element.
     * @example
     * ```typescript
     * const texture = await Assets.load('https://pixijs.com/assets/bunny.png');
     * const sprite = Sprite.from(texture);
     * canvas.add("bunny", sprite);
     * ```
     */
    add(
        alias: string,
        canvasComponent: CanvasBaseInterface<any>,
        options?: {
            /**
             * If there is a canvas element with the same alias, the "style" of the old canvas element will be imported to the new canvas element.
             * @default false
             */
            ignoreOldStyle?: boolean;
            /**
             * The zIndex of the canvas element.
             * @default undefined
             */
            zIndex?: number;
        }
    ): void;
    /**
     * Remove a canvas element from the canvas.
     * And remove all tickers that are not connected to any canvas element.
     * @param alias The alias of the canvas element to be removed.
     * @param options The options of the canvas element.
     * @returns
     * @example
     * ```typescript
     * canvas.remove("bunny");
     * ```
     */
    remove(
        alias: string | string[],
        options?: {
            /**
             * If true, the tickers that are connected to the canvas element will not be removed.
             * @default false
             */
            ignoreTickers?: boolean;
        }
    ): void;
    /**
     * Get a canvas element by the alias.
     * @param alias The alias of the canvas element.
     * @returns The canvas element.
     * @example
     * ```typescript
     * const sprite = canvas.find<Sprite>("bunny");
     * ```
     */
    find<T extends CanvasBaseInterface<any>>(alias: string): T | undefined;
    /**
     * Check if a DisplayObject is on the canvas.
     * @param pixiElement The DisplayObject to be checked.
     * @returns If the DisplayObject is on the canvas.
     */
    canvasElementIsOnCanvas<T extends PixiContainer>(pixiElement: T): boolean;
    /**
     * Remove all canvas elements from the canvas.
     */
    removeAll(): void;
    /**
     * Edit the alias of a canvas element. The tickers that are connected to the canvas element will be transferred.
     * @param oldAlias The old alias of the canvas element.
     * @param newAlias The new alias of the canvas element.
     * @param options The options of the canvas element.
     */
    editAlias(
        oldAlias: string,
        newAlias: string,
        options?: {
            /**
             * If true, the tickers that are connected to the canvas element will not be transferred.
             * @default false
             */
            ignoreTickers?: boolean;
        }
    ): void;

    /** Edit Tickers Methods */

    /**
     * Currently tickers that are running.
     */
    readonly currentTickers: { [id: string]: TickerInfo<any> };
    /**
     * The steps of the tickers
     */
    readonly currentTickersSteps: {
        [alias: string]: {
            [tickerId: string]: TickersSequence;
        };
    };
    /**
     * Run a ticker. You can run multiple addTicker with the same alias and different tickerClasses.
     * If you run a ticker with the same alias and tickerClass, the old ticker will be removed.
     * If already exists a sequence of tickers with the same alias, it will be removed.
     * @param canvasElementAlias The alias of the canvas element that will use the ticker.
     * @param ticker The ticker class to be run.
     * @returns The id of the ticker.
     * @example
     * ```typescript
     * canvas.addTicker("alien", new RotateTicker({ speed: 0.2 }))
     * ```
     */
    addTicker<TArgs extends TickerArgs>(
        canvasElementAlias: string | string[],
        ticker: Ticker<TArgs>
    ): string | undefined;
    /**
     * Run a sequence of tickers.
     * @param alias The alias of canvas element that will use the tickers.
     * @param steps The steps of the tickers.
     * @param currentStepNumber The current step number. It is used to continue the sequence of tickers.
     * @returns The id of tickers.
     * @example
     * ```typescript
     * canvas.addTickersSequence("alien", [
     *     new RotateTicker({ speed: 0.1, clockwise: true }, 2), // 2 seconds
     *     Pause(1), // 1 second
     *     new RotateTicker({ speed: 0.2, clockwise: false }, 2),
     *     Repeat,
     * ])
     * ```
     */
    addTickersSequence(
        alias: string,
        steps: (Ticker<any> | RepeatType | PauseType)[],
        currentStepNumber?: number
    ): string | undefined;
    /**
     * Remove a connection between a canvas element and a ticker.
     * And remove the ticker if there is no canvas element connected to it.
     * @param alias The alias of the canvas element that will use the ticker.
     * @param ticker The ticker class to be removed.
     * @example
     * ```typescript
     * canvas.unlinkComponentFromTicker("alien", RotateTicker)
     * ```
     */
    unlinkComponentFromTicker(alias: string | string[], ticker?: { new (): Ticker<any> } | string): void;
    /**
     * Remove all tickers from the canvas.
     */
    removeAllTickers(): void;
    /**
     * Remove a ticker by the id.
     * @param tickerId The id of the ticker.
     */
    removeTicker(tickerId: string | string[]): void;
    /**
     * Pause a ticker. If a paused ticker have a time to be removed, it will be removed after the time.
     * @param alias The alias of the canvas element that will use the ticker.
     * @param options The options of the pause ticker.
     */
    pauseTicker(alias: string, options?: PauseTickerType): void;
    /**
     * Resume a ticker.
     * @param alias The alias of the canvas element that will use the ticker.
     */
    resumeTicker(alias: string | string[]): void;
    /**
     * Check if a ticker is paused.
     * @param alias The alias of the canvas element that will use the ticker.
     * @param tickerId The ticker that will be checked.
     * @returns If the ticker is paused.
     */
    isTickerPaused(alias: string, tickerId?: string): boolean;
    /**
     * Add a ticker that must be completed before the next step.
     * This method is used for example into a transition between scenes.
     * @param step The step that the ticker must be completed before the next step.
     */
    completeTickerOnStepEnd(step: {
        /**
         * The id of the step.
         */
        id: string;
        /**
         * If is a sequence of tickers, the alias of the sequence of tickers.
         */
        alias?: string;
    }): void;
    /**
     * This method force the completion of the tickers that are running.
     * This funcions is called in the next step.
     * @param id The id of the ticker. If the alias provided, the id is the id of the sequence of tickers.
     * @param alias The alias of the sequence of tickers.
     */
    forceCompletionOfTicker(id: string, alias?: string): void;
    /**
     * Animate a Pixi’VN component or components using [motion's animate](https://motion.dev/docs/animate) function.
     * This function integrates with the PixiJS ticker to ensure smooth animations.
     *
     * Pixi’VN will keep track of the animation state of this function.
     * So Pixi’VN will save the animation state in saves.
     * @param components - The PixiJS component(s) to animate.
     * @param keyframes - The keyframes to animate the component(s) with.
     * @param options - Additional options for the animation, including duration, easing, and ticker.
     * @returns The id of tickers.
     * @template T - The type of Pixi’VN component(s) being animated.
     */
    animate<T extends CanvasBaseInterface<any>>(
        components: T | T[] | string | string[],
        keyframes: ObjectTarget<T>,
        options: AnimationOptions & CommonTickerProps
    ): string | undefined;

    /* Layers Methods */

    /**
     * Add a layer to the canvas.
     * @param label The label of the layer.
     * @param layer The layer to be added.
     * @returns The layer.
     * @example
     * ```typescript
     * const uiLayer = new Container();
     * canvas.addLayer("ui", uiLayer);
     * ```
     */
    addLayer(label: string, layer: PixiContainer): PixiContainer<ContainerChild> | undefined;
    /**
     * Get a layer from the canvas.
     * @param label The label of the layer.
     * @returns The layer.
     * @example
     * ```typescript
     * const uiLayer = canvas.getLayer("ui");
     * ```
     */
    getLayer(label: string): PixiContainer<ContainerChild> | null;
    /**
     * Remove a layer from the canvas.
     * @param label The label of the layer to be removed.
     * @example
     * ```typescript
     * canvas.removeLayer("ui");
     * ```
     */
    removeLayer(label: string): void;
    /**
     * Add a HTML layer to the canvas.
     * @param id The id of the layer.
     * @param element The html element to be added.
     * @param style The style of the layer. @default { position: "absolute", pointerEvents: "none" }.
     * @example
     * ```tsx
     * const root = document.getElementById('root')
     * if (!root) {
     *     throw new Error('root element not found')
     * }
     * const htmlLayer = canvas.addHtmlLayer("ui", root, {
     *    position: "absolute",
     *    pointerEvents: "none"
     * })
     * const reactRoot = createRoot(htmlLayer)
     * reactRoot.render(
     *     <App />
     * )
     * ```
     */
    addHtmlLayer(
        id: string,
        element: HTMLElement,
        style?: Pick<CSSStyleDeclaration, "position" | "pointerEvents">
    ): HTMLDivElement;
    /**
     * Get a HTML layer from the canvas.
     * @param id The id of the layer to be removed.
     */
    removeHtmlLayer(id: string): void;
    /**
     * Get a HTML layer from the canvas.
     * @param id The id of the layer.
     */
    getHtmlLayer(id: string): HTMLElement | undefined;

    /* Other Methods */

    /**
     * Extract the canvas as an image.
     * @returns The image as a base64 string.
     */
    extractImage(): Promise<string>;

    /**
     * Clear the canvas and the tickers.
     */
    clear(): void;

    /* Export and Import Methods */

    /**
     * Export the canvas and the tickers to an object.
     * @returns The object.
     */
    export(): CanvasGameState;
    /**
     * Restore the canvas and the tickers from an object.
     * @param data The object.
     */
    restore(data: object): Promise<void>;
    /**
     * @deprecated Use {@link onTickerComplete}
     */
    onEndOfTicker(
        tickerId: string,
        options: {
            aliasToRemoveAfter: string[] | string;
            tickerAliasToResume: string[] | string;
            ignoreTickerSteps?: boolean;
        }
    ): void;
    onTickerComplete(
        tickerId: string,
        options: {
            aliasToRemoveAfter: string[] | string;
            tickerAliasToResume: string[] | string;
            ignoreTickerSteps?: boolean;
        }
    ): void;
}
