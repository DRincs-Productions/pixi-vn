import { Application, ApplicationOptions, Container as PixiContainer } from "@drincs/pixi-vn/pixi.js";
import { Devtools, initDevtools } from "@pixi/devtools";
import sha1 from "crypto-js/sha1";
import { CANVAS_APP_GAME_LAYER_ALIAS } from "../constants";
import { logger } from "../utils/log-utility";
import additionalPositionsProperties from "./pixi-devtools/additionalPositionsProperties";
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
            logger.error("The canvas is not initialized");
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
        options?: Partial<ApplicationOptions> & {
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
        const {
            id = "pixi-vn-canvas",
            width = 800,
            height = 600,
            resolution = 1,
            autoDensity = true,
            resizeMode = "contain",
            resizeTo = element,
            ...rest
        } = options || {};
        CanvasManagerStatic.canvasWidth = width;
        CanvasManagerStatic.canvasHeight = height;
        CanvasManagerStatic._app = new Application();
        return CanvasManagerStatic.app
            .init({
                width,
                height,
                resolution,
                autoDensity,
                resizeTo,
                ...rest,
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
                CanvasManagerStatic.addCanvasIntoHTMLElement(element, id);
                // listen for the browser telling us that the screen size changed
                switch (resizeMode) {
                    case "contain":
                        const throttledResize = throttle(() => CanvasManagerStatic.resize(), 10);
                        app.renderer.on("resize", throttledResize);
                        // call it manually once so we are sure we are the correct size after starting
                        CanvasManagerStatic.resize();
                        break;
                    case "none":
                    default:
                        break;
                }
                // add the game layer
                CanvasManagerStatic.gameLayer;
            });
    }
    /**
     * Add the canvas into a html element.
     * @param element it is the html element where I will put the canvas. Example: document.body
     * @param id it is the id of the canvas element.
     */
    private static addCanvasIntoHTMLElement(element: HTMLElement, id: string) {
        if (CanvasManagerStatic._isInitialized) {
            element.appendChild(CanvasManagerStatic.app.canvas as HTMLCanvasElement);
            CanvasManagerStatic.app.canvas.id = id;
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
        },
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
     * This method is called when the screen is resized.
     */
    private static async resize(): Promise<void> {
        const canvasWidth = CanvasManagerStatic.canvasWidth;
        const canvasHeight = CanvasManagerStatic.canvasHeight;
        let container = CanvasManagerStatic.app.resizeTo;
        if (!(container instanceof HTMLElement)) {
            container = document.documentElement;
        }
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const horizontalMargin = 0;
        const verticalMargin = 0;
        const scale = Math.min(containerWidth / canvasWidth, containerHeight / canvasHeight);

        CanvasManagerStatic.app.stage.scale.set(scale);
        CanvasManagerStatic.app.stage.x = horizontalMargin;
        CanvasManagerStatic.app.stage.y = verticalMargin;

        const screenWidth = Math.floor(scale * canvasWidth);
        const screenHeight = Math.floor(scale * canvasHeight);

        const promises = CanvasManagerStatic.htmlLayers.map((layer) => {
            layer.style.width = `${screenWidth}px`;
            layer.style.height = `${screenHeight}px`;
            layer.style.marginLeft = `${horizontalMargin}px`;
            layer.style.marginRight = `${horizontalMargin}px`;
            layer.style.marginTop = `${verticalMargin}px`;
            layer.style.marginBottom = `${verticalMargin}px`;
        });
        await Promise.all(promises);
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
                    CanvasManagerStatic.gameLayer.getChildIndex(a) - CanvasManagerStatic.gameLayer.getChildIndex(b),
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
                        id: info.ticker.id,
                        args: info.ticker.args,
                        canvasElementAliases: info.ticker.canvasElementAliases,
                        priority: info.ticker.priority,
                        duration: info.ticker.duration,
                        paused: info.ticker.paused,
                    },
                ]),
        );
    }
    static _currentTickers: { [id: string]: TickerInfo<any> } = {};
    static _currentTickersSequence: { [alias: string]: { [tickerId: string]: TickersSequence } } = {};
    static _currentTickersTimeouts: { [timeout: string]: TickerTimeoutHistory } = {};
    static _tickersToCompleteOnStepEnd: {
        tikersIds: { id: string }[];
        stepAlias: { id: string; alias: string }[];
    } = { tikersIds: [], stepAlias: [] };
    /**
     * @deprecated
     */
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
        canBeDeletedBeforeEnd: boolean,
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
