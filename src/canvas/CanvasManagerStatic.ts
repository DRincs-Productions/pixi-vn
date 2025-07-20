import { Devtools, initDevtools } from "@pixi/devtools";
import sha1 from "crypto-js/sha1";
import { Application, ApplicationOptions, Container as PixiContainer } from "pixi.js";
import { CANVAS_APP_GAME_LAYER_ALIAS } from "../constants";
import additionalPositionsProperties from "../pixi-devtools/additionalPositionsProperties";
import { logger } from "../utils/log-utility";
import { TickerHistory, TickerInfo, TickersSequence, TickerTimeoutHistory } from "./tickers";
import PauseTickerType from "./types/PauseTickerType";

function throttle(func: (...args: any[]) => Promise<void>, limit: number) {
    let lastCall = 0;
    return async (...args: any[]) => {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            return await func(...args);
        }
    };
}

/**
 * This class is responsible for managing the canvas, the tickers, the events, and the window size and the children of the window.
 */
export default class CanvasManagerStatic {
    private constructor() {}

    private static _app: Application | undefined = undefined;
    static get app() {
        if (!CanvasManagerStatic._app) {
            throw new Error("[Pixi’VN] CanvasManagerStatic.app is undefined");
        }
        return CanvasManagerStatic._app;
    }
    static get gameLayer() {
        let layer = this.app.stage.getChildByLabel(CANVAS_APP_GAME_LAYER_ALIAS);
        if (!layer) {
            layer = new PixiContainer();
            layer.label = CANVAS_APP_GAME_LAYER_ALIAS;
            this.app.stage.addChild(layer);
        }
        return layer;
    }
    /**
     * This is the div that have same size of the canvas.
     * This is useful to put interface elements.
     * You can use React or other framework to put elements in this div.
     */
    static htmlLayers: HTMLElement[] = [];
    static canvasWidth: number = 300;
    static canvasHeight: number = 300;
    static _isInitialized: boolean = false;

    static async init(
        element: HTMLElement,
        width: number,
        height: number,
        options?: Partial<ApplicationOptions>,
        devtoolsOptions?: Devtools
    ): Promise<void> {
        CanvasManagerStatic.canvasWidth = width;
        CanvasManagerStatic.canvasHeight = height;
        CanvasManagerStatic._app = new Application();
        return CanvasManagerStatic.app
            .init({
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
                width: width,
                height: height,
                ...options,
            })
            .then(() => {
                const {
                    app = CanvasManagerStatic.app,
                    extensions = [],
                    ...devtoolsOptionsRest
                } = devtoolsOptions || {};
                initDevtools({
                    app: app,
                    extensions: [additionalPositionsProperties, ...extensions],
                    ...devtoolsOptionsRest,
                });

                CanvasManagerStatic._isInitialized = true;
                // Manager.app.ticker.add(Manager.update)
                CanvasManagerStatic.addCanvasIntoHTMLElement(element);
                // listen for the browser telling us that the screen size changed
                window.addEventListener("resize", CanvasManagerStatic.resize);

                // call it manually once so we are sure we are the correct size after starting
                CanvasManagerStatic.resize();

                // add the game layer
                CanvasManagerStatic.gameLayer;
            });
    }
    /**
     * Add the canvas into a html element.
     * @param element it is the html element where I will put the canvas. Example: document.body
     */
    private static addCanvasIntoHTMLElement(element: HTMLElement) {
        if (CanvasManagerStatic._isInitialized) {
            element.appendChild(CanvasManagerStatic.app.canvas as HTMLCanvasElement);
        } else {
            logger.error("GameWindowManager is not initialized");
        }
    }
    static addHtmlLayer(
        id: string,
        element: HTMLElement,
        style: Pick<CSSStyleDeclaration, "position" | "pointerEvents"> = {
            position: "absolute",
            pointerEvents: "none",
        }
    ) {
        let div = document.createElement("div");
        div.setAttribute("id", id);
        div.style.position = style.position;
        div.style.pointerEvents = style.pointerEvents;
        let res = element.appendChild(div);
        CanvasManagerStatic.htmlLayers.push(div);
        CanvasManagerStatic.resize();
        return res;
    }
    static removeHtmlLayer(id: string) {
        let div = CanvasManagerStatic.htmlLayers.find((layer) => layer.id === id);
        if (div) {
            div.remove();
            CanvasManagerStatic.htmlLayers = CanvasManagerStatic.htmlLayers.filter((layer) => layer.id !== id);
        }
    }
    static getHtmlLayer(id: string): HTMLElement | undefined {
        return CanvasManagerStatic.htmlLayers.find((layer) => layer.id === id);
    }

    /* Resize Metods */

    /**
     * This method returns the scale of the screen.
     */
    private static get screenScale() {
        let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        let screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        return Math.min(screenWidth / CanvasManagerStatic.canvasWidth, screenHeight / CanvasManagerStatic.canvasHeight);
    }
    /**
     * This method returns the width of the screen enlarged by the scale.
     */
    private static get screenWidth() {
        return Math.floor(CanvasManagerStatic.screenScale * CanvasManagerStatic.canvasWidth);
    }
    /**
     * This method returns the height of the screen enlarged by the scale.
     */
    private static get screenHeight() {
        return Math.floor(CanvasManagerStatic.screenScale * CanvasManagerStatic.canvasHeight);
    }
    /**
     * This method returns the horizontal margin of the screen.
     */
    private static get horizontalMargin() {
        let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        return (screenWidth - CanvasManagerStatic.screenWidth) / 2;
    }
    /**
     * This method returns the vertical margin of the screen.
     */
    private static get verticalMargin() {
        let screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        return (screenHeight - CanvasManagerStatic.screenHeight) / 2;
    }
    /**
     * This method is called when the screen is resized.
     */
    private static async resize(): Promise<void> {
        const resize = throttle(async () => {
            // now we use css trickery to set the sizes and margins
            if (CanvasManagerStatic._isInitialized) {
                let style = CanvasManagerStatic.app.canvas.style;
                style.width = `${CanvasManagerStatic.screenWidth}px`;
                style.height = `${CanvasManagerStatic.screenHeight}px`;
                (style as any).marginLeft = `${CanvasManagerStatic.horizontalMargin}px`;
                (style as any).marginRight = `${CanvasManagerStatic.horizontalMargin}px`;
                (style as any).marginTop = `${CanvasManagerStatic.verticalMargin}px`;
                (style as any).marginBottom = `${CanvasManagerStatic.verticalMargin}px`;
            }

            const promises = CanvasManagerStatic.htmlLayers.map((layer) => {
                layer.style.width = `${CanvasManagerStatic.screenWidth}px`;
                layer.style.height = `${CanvasManagerStatic.screenHeight}px`;
                layer.style.marginLeft = `${CanvasManagerStatic.horizontalMargin}px`;
                layer.style.marginRight = `${CanvasManagerStatic.horizontalMargin}px`;
                layer.style.marginTop = `${CanvasManagerStatic.verticalMargin}px`;
                layer.style.marginBottom = `${CanvasManagerStatic.verticalMargin}px`;
            });
            await Promise.all(promises);
        }, 10);
        await resize();
    }

    /* Edit Canvas Elements Methods */

    /**
     * The order of the elements in the canvas, is determined by the zIndex.
     */
    static get childrenAliasesOrder(): string[] {
        return CanvasManagerStatic.gameLayer.children
            .filter((child) => child.label)
            .sort(
                (a, b) =>
                    CanvasManagerStatic.gameLayer.getChildIndex(a) - CanvasManagerStatic.gameLayer.getChildIndex(b)
            )
            .map((item) => item.label);
    }

    /** Edit Tickers Methods */

    static get currentTickersWithoutCreatedBySteps(): {
        [k: string]: TickerHistory<any>;
    } {
        return Object.fromEntries(
            Object.entries(CanvasManagerStatic._currentTickers)
                .filter(([_, info]) => !info.createdByTicketSteps)
                .map(([id, info]) => [
                    id,
                    {
                        id: info.id,
                        args: info.ticker.args,
                        canvasElementAliases: info.canvasElementAliases,
                        priority: info.ticker.priority,
                        duration: info.ticker.duration,
                    },
                ])
        );
    }
    static _currentTickers: { [id: string]: TickerInfo<any> } = {};
    static _currentTickersSequence: { [alias: string]: { [tickerId: string]: TickersSequence } } = {};
    static _currentTickersTimeouts: { [timeout: string]: TickerTimeoutHistory } = {};
    static _tickersToCompleteOnStepEnd: {
        tikersIds: { id: string }[];
        stepAlias: { id: string; alias: string }[];
    } = { tikersIds: [], stepAlias: [] };
    static _tickersOnPause: { [aliasOrId: string]: PauseTickerType } = {};
    static generateTickerId(tickerData: TickerInfo<any> | TickersSequence): string {
        try {
            return sha1(JSON.stringify(tickerData)).toString() + "_" + Math.random().toString(36).substring(7);
        } catch (e) {
            throw new Error(`[Pixi’VN] Error to generate ticker id: ${e}`);
        }
    }
    static addTickerTimeoutInfo(
        aliases: string | string[],
        ticker: string,
        timeout: string,
        canBeDeletedBeforeEnd: boolean
    ) {
        if (typeof aliases === "string") {
            aliases = [aliases];
        }
        CanvasManagerStatic._currentTickersTimeouts[timeout] = {
            aliases: aliases,
            ticker: ticker,
            canBeDeletedBeforeEnd: canBeDeletedBeforeEnd,
        };
    }
    static removeTickerTimeoutInfo(timeout: NodeJS.Timeout | string) {
        if (typeof timeout !== "string") {
            timeout = timeout.toString();
        }
        if (CanvasManagerStatic._currentTickersTimeouts[timeout]) {
            delete CanvasManagerStatic._currentTickersTimeouts[timeout];
        }
    }
    static removeTickerTimeout(timeout: NodeJS.Timeout | string) {
        if (typeof timeout !== "string") {
            timeout = timeout.toString();
        }
        clearTimeout(Number(timeout));
        CanvasManagerStatic.removeTickerTimeoutInfo(timeout);
    }
    static removeTickerTimeoutsByAlias(alias: string, checkCanBeDeletedBeforeEnd: boolean) {
        // todo
        Object.entries(CanvasManagerStatic._currentTickersTimeouts).forEach(([timeout, tickerTimeout]) => {
            let aliasesWithoutAliasToRemove = tickerTimeout.aliases.filter((t) => t !== alias);
            if (aliasesWithoutAliasToRemove.length === 0) {
                let canBeDeletedBeforeEnd = tickerTimeout.canBeDeletedBeforeEnd;
                if (!checkCanBeDeletedBeforeEnd || canBeDeletedBeforeEnd) {
                    CanvasManagerStatic.removeTickerTimeout(timeout);
                }
            } else {
                CanvasManagerStatic._currentTickersTimeouts[timeout].aliases = aliasesWithoutAliasToRemove;
            }
        });
    }
}
