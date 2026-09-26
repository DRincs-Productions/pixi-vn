import CanvasManagerStatic from "@canvas/CanvasManagerStatic";
import RegisteredCanvasComponents, {
    setMemoryContainer,
} from "@canvas/decorators/canvas-element-decorator";
import { importCanvasElement } from "@canvas/functions/canvas-import-utility";
import { exportCanvasElement, getMemoryContainer } from "@canvas/functions/canvas-memory-utility";
import type { CanvasBaseInterface } from "@canvas/interfaces/CanvasBaseInterface";
import type CanvasGameState from "@canvas/interfaces/CanvasGameState";
import type CanvasHtmlLayersInterface from "@canvas/interfaces/CanvasHtmlLayersInterface";
import type CanvasLayersInterface from "@canvas/interfaces/CanvasLayersInterface";
import type CanvasManagerInterface from "@canvas/interfaces/CanvasManagerInterface";
import type CanvasBaseItemMemory from "@canvas/interfaces/memory/CanvasBaseItemMemory";
import { CANVAS_APP_GAME_LAYER_ALIAS } from "@constants";
import { GameUnifier } from "@drincs/pixi-vn/core";
import type {
    AnimationOptions,
    KeyframesType,
    ObjectSegment,
    ObjectSegmentWithTransition,
    SequenceOptions,
} from "@drincs/pixi-vn/motion";
import type {
    ApplicationOptions,
    ImageLike,
    Container as PixiContainer,
    UPDATE_PRIORITY,
} from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import {
    RegisteredTickers,
    removeTicker as removeTickerFromTickers,
    runTickersSequence,
    tickers,
    TickersManagerStatic,
    type Ticker,
    type TickerArgs,
    type TickersInterface,
} from "@drincs/pixi-vn/tickers";
import type { Devtools } from "@pixi/devtools";
import { createExportableElement } from "@utils/export-utility";
import { logger } from "@utils/log-utility";

/**
 * This class is responsible for managing the canvas, the tickers, the events, and the window size and the children of the window.
 */
export default class CanvasManager implements CanvasManagerInterface {
    private tickersPausedByGameLayerRender: string[] = [];

    get app() {
        return CanvasManagerStatic.app;
    }
    get gameLayer() {
        return CanvasManagerStatic.gameLayer;
    }
    get isInitialized() {
        return CanvasManagerStatic._isInitialized;
    }
    get width() {
        return CanvasManagerStatic.canvasWidth;
    }
    get height() {
        return CanvasManagerStatic.canvasHeight;
    }
    get screen() {
        return this.app.screen;
    }

    public async init(
        element: HTMLElement,
        options: Partial<ApplicationOptions> & {
            /**
             * The id of the canvas element.
             * @default "pixi-vn-canvas"
             */
            id?: string;
            /**
             * The resize mode of the canvas.
             * @default "contain"
             */
            resizeMode?: "contain" | "none";
        },
        devtoolsOptions?: Devtools,
    ): Promise<void> {
        return await CanvasManagerStatic.init(element, options, devtoolsOptions);
    }

    /* Edit Canvas Elements Methods */

    get children() {
        return CanvasManagerStatic.gameLayer.children;
    }
    async copyCanvasElementProperty<T extends CanvasBaseItemMemory>(
        oldAlias: T | CanvasBaseInterface<T> | string,
        newAlias: CanvasBaseInterface<T> | string,
        options: {
            ignoreProperties?: (defaultProperties: string[]) => string[];
        } = {},
    ) {
        const defaultPropertiesWhichCanBeIgnored = [
            "isRenderGroup",
            "scale",
            "visible",
            "boundsArea",
            "text",
            "resolution",
            "style",
            "height",
            "width",
        ];
        const { ignoreProperties = (defaultProperties) => defaultProperties } = options;
        if (typeof newAlias === "string") {
            const element = this.find(newAlias);
            if (element) {
                newAlias = element;
            } else {
                logger.error(`Canvas element ${newAlias} not found`);
                return;
            }
        }
        if (typeof oldAlias === "string") {
            const element = this.find(oldAlias);
            if (element) {
                oldAlias = element;
            } else {
                logger.error(`Canvas element ${oldAlias} not found`);
                return;
            }
        }
        if (oldAlias instanceof PIXI.Container) {
            oldAlias = oldAlias.memory;
        }
        const propertiesToIgnore = ignoreProperties(defaultPropertiesWhichCanBeIgnored);
        const clonedOldAlias = { ...(oldAlias as T) };
        propertiesToIgnore.forEach((property) => {
            if (property in clonedOldAlias) {
                delete clonedOldAlias[property as keyof T];
            }
        });
        await RegisteredCanvasComponents.copyProperty(newAlias.pixivnId, newAlias, clonedOldAlias);
    }
    public add(
        alias: string,
        canvasComponent: CanvasBaseInterface<any>,
        options: {
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
        } = {},
    ) {
        if (alias === CANVAS_APP_GAME_LAYER_ALIAS) {
            logger.error(`The alias ${CANVAS_APP_GAME_LAYER_ALIAS} is reserved`);
            return;
        }

        const oldCanvasElement = this.find(alias);

        const ignoreOldStyle = options?.ignoreOldStyle;
        if (oldCanvasElement && !ignoreOldStyle) {
            this.copyCanvasElementProperty(oldCanvasElement, canvasComponent);
        }

        const { zIndex = oldCanvasElement?.parent?.getChildIndex(oldCanvasElement) } = options;
        if (oldCanvasElement && !this.canvasElementIsOnCanvas(oldCanvasElement)) {
            logger.error(
                `The canvas element ${alias} exist in the memory but it is not on the canvas, so the zIndex is not set`,
            );
        } else if (oldCanvasElement) {
            this.remove(alias, { ignoreTickers: true });
        }

        if (zIndex !== undefined) {
            canvasComponent.label = alias;
            this.gameLayer.addChildAt(canvasComponent, zIndex);
        } else {
            canvasComponent.label = alias;
            this.gameLayer.addChild(canvasComponent);
        }
    }
    public remove(
        alias: string | string[],
        options: {
            /**
             * If true, the tickers that are connected to the canvas element will not be removed.
             * @default false
             */
            ignoreTickers?: boolean;
        } = {},
    ) {
        if (alias === CANVAS_APP_GAME_LAYER_ALIAS) {
            logger.error(`The alias ${CANVAS_APP_GAME_LAYER_ALIAS} is reserved`);
            return;
        }
        const ignoreTickers = options.ignoreTickers;
        if (typeof alias === "string") {
            alias = [alias];
        }
        alias.forEach((alias) => {
            this.gameLayer.getChildrenByLabel(alias).forEach((canvasComponent) => {
                this.gameLayer.removeChild(canvasComponent);
                !ignoreTickers && tickers.unlinkComponent(alias);
            });
        });
    }
    public find<T extends CanvasBaseInterface<any>>(alias: string): T | undefined {
        if (alias === CANVAS_APP_GAME_LAYER_ALIAS) {
            return this.gameLayer as T;
        }
        const canvasComponent = this.gameLayer.getChildByLabel(alias);
        if (canvasComponent) {
            return canvasComponent as T;
        }
        return undefined;
    }
    public canvasElementIsOnCanvas<T extends PixiContainer>(pixiElement: T) {
        return this.gameLayer.children.includes(pixiElement);
    }
    public removeAll() {
        this.gameLayer.removeChildren();
    }
    public editAlias(
        oldAlias: string,
        newAlias: string,
        options: {
            /**
             * If true, the tickers that are connected to the canvas element will not be transferred.
             * @default false
             */
            ignoreTickers?: boolean;
        } = {},
    ) {
        const canvasComponent = this.find(oldAlias);
        if (canvasComponent) {
            canvasComponent.label = newAlias;
        }
        !options.ignoreTickers && tickers.transfer(oldAlias, newAlias, "move");
    }

    /** Edit Tickers Methods */

    /**
     * @deprecated Use the top-level `tickers` module (`@drincs/pixi-vn/tickers`) instead.
     */
    public get currentTickers() {
        return this.tickers.currentTickers;
    }
    /**
     * @deprecated Use the top-level `tickers` module (`@drincs/pixi-vn/tickers`) instead.
     */
    public get currentTickersSteps() {
        return this.tickers.currentTickersSteps;
    }
    /**
     * @deprecated Use the top-level `tickers` module (`@drincs/pixi-vn/tickers`) instead.
     */
    findTicker<TArgs extends TickerArgs>(tickerId: string): Ticker<TArgs> | undefined {
        return tickers.find<TArgs>(tickerId);
    }
    /**
     * @deprecated Use the top-level `tickers` module (`@drincs/pixi-vn/tickers`) instead.
     */
    addTicker<TArgs extends TickerArgs>(
        canvasElementAlias: string | string[],
        ticker: Ticker<TArgs>,
    ) {
        return tickers.add(canvasElementAlias, ticker);
    }
    /**
     * @deprecated Use the top-level `tickers` module (`@drincs/pixi-vn/tickers`) instead.
     */
    addTickersSequence(alias: string, steps: Ticker<any>[], currentStepNumber = 0) {
        return tickers.addSequence(alias, steps, currentStepNumber);
    }
    /**
     * @deprecated Use the top-level `tickers` module (`@drincs/pixi-vn/tickers`) instead.
     */
    public onTickerComplete(
        tickerId: string,
        options: {
            aliasToRemoveAfter: string[];
            tickerAliasToResume: string[];
            tickerIdToResume: string[];
            ignoreTickerSteps?: boolean;
            stopTicker?: boolean;
        },
    ) {
        return tickers.onComplete(tickerId, options);
    }
    /**
     * @deprecated Use the top-level `tickers` module (`@drincs/pixi-vn/tickers`) instead.
     */
    public unlinkComponentFromTicker(
        alias: string | string[],
        ticker?:
            | { new (args: any, duration?: number, priority?: UPDATE_PRIORITY): Ticker<any> }
            | string,
    ) {
        return tickers.unlinkComponent(alias, ticker as { new (): Ticker<any> } | string | undefined);
    }
    /**
     * @deprecated Use the top-level `tickers` module (`@drincs/pixi-vn/tickers`) instead.
     */
    public removeAllTickers() {
        return tickers.removeAll();
    }
    /**
     * @deprecated Use the top-level `tickers` module (`@drincs/pixi-vn/tickers`) instead.
     */
    removeTicker(
        tickerId: string | string[],
        options: {
            stopTicker?: boolean;
        } = { stopTicker: true },
    ) {
        return removeTickerFromTickers(tickerId, options);
    }
    /**
     * @deprecated Use the top-level `tickers` module (`@drincs/pixi-vn/tickers`) instead.
     */
    pauseTicker(
        filters:
            | {
                  canvasAlias: string;
                  tickerIdsExcluded?: string[];
              }
            | {
                  id: string | string[];
              },
    ) {
        return tickers.pause(filters);
    }
    /**
     * @deprecated Use the top-level `tickers` module (`@drincs/pixi-vn/tickers`) instead.
     */
    resumeTicker(
        filters:
            | {
                  canvasAlias: string;
              }
            | {
                  id: string | string[];
              },
    ) {
        return tickers.resume(filters);
    }
    /**
     * @deprecated Use the top-level `tickers` module (`@drincs/pixi-vn/tickers`) instead.
     */
    isTickerPaused(_alias: string, _tickerId?: string): boolean {
        return tickers.isPaused(_alias, _tickerId);
    }
    pause() {
        if (this.gameLayer.renderable === false) {
            return;
        }
        this.gameLayer.renderable = false;
        this.tickersPausedByGameLayerRender = tickers.pause({
            id: Array.from(TickersManagerStatic._currentTickers.keys()),
        });
    }
    resume() {
        if (this.gameLayer.renderable === true) {
            return;
        }
        this.gameLayer.renderable = true;
        const tickerIdsToResume = this.tickersPausedByGameLayerRender.filter((id) =>
            TickersManagerStatic._currentTickers.has(id),
        );
        if (tickerIdsToResume.length > 0) {
            tickers.resume({ id: tickerIdsToResume });
        }
        this.tickersPausedByGameLayerRender = [];
    }
    /**
     * @deprecated Use the top-level `tickers` module (`@drincs/pixi-vn/tickers`) instead.
     */
    transferTickers(oldAlias: string, newAlias: string, mode: "move" | "duplicate" = "move") {
        return tickers.transfer(oldAlias, newAlias, mode);
    }
    /**
     * @deprecated Use the top-level `tickers` module (`@drincs/pixi-vn/tickers`) instead.
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
    }) {
        return tickers.completeOnStepEnd(step);
    }
    /**
     * @deprecated Use the top-level `tickers` module (`@drincs/pixi-vn/tickers`) instead.
     */
    async forceCompletionOfTicker(id: string, alias?: string) {
        return tickers.forceCompletion(id, alias);
    }

    /**
     * Namespace for operations on canvas tickers.
     * @deprecated Use the top-level `tickers` module (`@drincs/pixi-vn/tickers`) instead.
     */
    public readonly tickers: TickersInterface = tickers;

    animate<T extends CanvasBaseInterface<any>>(
        components: T | string | (string | T)[],
        keyframes: KeyframesType<T>,
        options?: AnimationOptions,
        priority?: UPDATE_PRIORITY,
    ): string | undefined;
    animate<T extends CanvasBaseInterface<any>>(
        components: T | string,
        sequence: (ObjectSegment<T> | ObjectSegmentWithTransition<T>)[],
        options?: SequenceOptions,
        priority?: UPDATE_PRIORITY,
    ): string | undefined;
    animate<T extends CanvasBaseInterface<any>>(
        components: T | string | (string | T)[],
        keyframes: KeyframesType<T> | (ObjectSegment<T> | ObjectSegmentWithTransition<T>)[],
        options?: AnimationOptions | SequenceOptions,
        priority?: UPDATE_PRIORITY,
    ): string | undefined {
        return GameUnifier.animate(components, keyframes, options, priority);
    }

    /* Layers Methods */

    private addLayerInternal(label: string, layer: PixiContainer) {
        if (label === CANVAS_APP_GAME_LAYER_ALIAS) {
            logger.error(`The alias ${CANVAS_APP_GAME_LAYER_ALIAS} is reserved`);
            return;
        }
        layer.label = label;
        return CanvasManagerStatic.app.stage.addChild(layer);
    }

    private getLayerInternal(label: string) {
        return CanvasManagerStatic.app.stage.getChildByLabel(label);
    }

    private removeLayerInternal(label: string) {
        const child = CanvasManagerStatic.app.stage.getChildByLabel(label);
        if (child) {
            CanvasManagerStatic.app.stage.removeChild(child);
        }
    }

    private addHtmlLayerInternal(
        id: string,
        element: HTMLElement,
        style?: Partial<Pick<CSSStyleDeclaration, "position" | "pointerEvents" | "userSelect">>,
    ) {
        return CanvasManagerStatic.addHtmlLayer(id, element, style);
    }
    private removeHtmlLayerInternal(id: string) {
        return CanvasManagerStatic.removeHtmlLayer(id);
    }
    private getHtmlLayerInternal(id: string): HTMLElement | undefined {
        return CanvasManagerStatic.getHtmlLayer(id);
    }

    addLayer(label: string, layer: PixiContainer) {
        return this.addLayerInternal(label, layer);
    }
    getLayer(label: string) {
        return this.getLayerInternal(label);
    }
    removeLayer(label: string) {
        return this.removeLayerInternal(label);
    }
    addHtmlLayer(
        id: string,
        element: HTMLElement,
        style?: Partial<Pick<CSSStyleDeclaration, "position" | "pointerEvents" | "userSelect">>,
    ) {
        return this.addHtmlLayerInternal(id, element, style);
    }
    removeHtmlLayer(id: string) {
        return this.removeHtmlLayerInternal(id);
    }
    getHtmlLayer(id: string): HTMLElement | undefined {
        return this.getHtmlLayerInternal(id);
    }

    public readonly layers: CanvasLayersInterface = {
        get gameLayer() {
            return CanvasManagerStatic.gameLayer;
        },
        add: (label, layer) => this.addLayerInternal(label, layer),
        get: (label) => this.getLayerInternal(label),
        remove: (label) => this.removeLayerInternal(label),
    };

    public readonly htmlLayers: CanvasHtmlLayersInterface = {
        add: (id, element, style) => this.addHtmlLayerInternal(id, element, style),
        get: (id) => this.getHtmlLayerInternal(id),
        remove: (id) => this.removeHtmlLayerInternal(id),
    };

    /* Other Methods */

    async extractImage() {
        const shouldRePause = this.gameLayer.renderable === false;
        if (shouldRePause) {
            this.resume();
        }
        let imagePromise: Promise<ImageLike>;
        try {
            imagePromise = this.app.renderer.extract.image(this.app.stage);
        } finally {
            if (shouldRePause) {
                this.pause();
            }
        }
        const image = await imagePromise;
        return image.src;
    }

    clear() {
        this.tickersPausedByGameLayerRender = [];
        tickers.removeAll();
        this.removeAll();
    }

    /* Export and Import Methods */

    public export(): CanvasGameState {
        const shouldRePause = this.gameLayer.renderable === false;
        if (shouldRePause) {
            this.resume();
        }
        try {
            const currentElements: { [alias: string]: CanvasBaseItemMemory } = {};
            this.children.forEach((child) => {
                if (child.label) {
                    currentElements[child.label] = exportCanvasElement(child);
                }
            });
            return {
                tickers: createExportableElement(
                    TickersManagerStatic.currentTickersWithoutCreatedBySteps(),
                ),
                tickersSteps: createExportableElement(TickersManagerStatic.currentTickersSequence()),
                elements: createExportableElement(currentElements),
                stage: createExportableElement(getMemoryContainer(this.gameLayer)),
                elementAliasesOrder: createExportableElement(
                    CanvasManagerStatic.childrenAliasesOrder,
                ),
                tickersToCompleteOnStepEnd: createExportableElement(
                    TickersManagerStatic._tickersToCompleteOnStepEnd,
                ),
            };
        } finally {
            if (shouldRePause) {
                this.pause();
            }
        }
    }
    public async restore(data: object) {
        this.clear();
        try {
            if (Object.hasOwn(data, "elements") && Object.hasOwn(data, "elementAliasesOrder")) {
                const elementAliasesOrder = (data as CanvasGameState).elementAliasesOrder;
                const elements: {
                    [alias: string]: CanvasBaseInterface<any>;
                } = {};
                const promises = Object.entries((data as CanvasGameState).elements).map(
                    async ([alias, element]) => {
                        elements[alias] = await importCanvasElement(element);
                    },
                );
                await Promise.all(promises);
                elementAliasesOrder.forEach((alias) => {
                    const element = elements[alias];
                    element && this.add(alias, element);
                });
            } else {
                logger.error(
                    "The data does not have the properties elementAliasesOrder and elements",
                );
                return;
            }
            if (Object.hasOwn(data, "stage") && Object.hasOwn(data, "stage")) {
                setMemoryContainer(this.gameLayer, (data as CanvasGameState).stage, {
                    ignoreScale: true,
                });
            } else {
                logger.error("The data does not have the properties stage");
            }
            if (Object.hasOwn(data, "tickers")) {
                const tickersData = (data as CanvasGameState).tickers;
                Object.entries(tickersData).forEach(([oldId, t]) => {
                    const aliases: string[] = t.canvasElementAliases;
                    if (aliases.length !== 0) {
                        const ticker = RegisteredTickers.getInstance(t.id, t.args, {
                            duration: t.duration,
                            priority: t.priority,
                            id: oldId,
                            canvasElementAliases: aliases,
                        });
                        if (ticker) {
                            ticker.canvasElementAliases = aliases;
                            tickers.add(aliases, ticker);
                            // TODO: it should be paused even before starting
                            // TODO: All tickets should be started at the same time and not wait for the previous one to initialize.
                            if (t.paused) {
                                ticker.pause();
                            }
                        } else {
                            logger.error(`Ticker ${t.id} not found`);
                        }
                    }
                });
            }
            if (Object.hasOwn(data, "tickersSteps")) {
                const tickersSteps = (data as CanvasGameState).tickersSteps;
                Object.entries(tickersSteps).forEach(([alias, steps]) => {
                    TickersManagerStatic._currentTickersSequence.set(
                        alias,
                        new Map(Object.entries(steps)),
                    );
                    Object.keys(steps).forEach((key) => {
                        runTickersSequence(alias, key);
                    });
                });
            }
            if (Object.hasOwn(data, "tickersToCompleteOnStepEnd")) {
                const tickersToCompleteOnStepEnd = (data as CanvasGameState)
                    .tickersToCompleteOnStepEnd;
                const tikersIds = tickersToCompleteOnStepEnd.tikersIds;
                const stepAlias = tickersToCompleteOnStepEnd.stepAlias.map((t) => ({
                    id: t.id,
                    alias: t.alias,
                }));
                TickersManagerStatic._tickersToCompleteOnStepEnd.tikersIds.length = 0;
                TickersManagerStatic._tickersToCompleteOnStepEnd.tikersIds.push(...tikersIds);
                TickersManagerStatic._tickersToCompleteOnStepEnd.stepAlias.length = 0;
                TickersManagerStatic._tickersToCompleteOnStepEnd.stepAlias.push(...stepAlias);
            }
        } catch (e) {
            logger.error("Error importing data", e);
        }
    }
}
