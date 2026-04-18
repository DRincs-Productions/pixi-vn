import additionalPositionsProperties from "@canvas/pixi-devtools/additionalPositionsProperties";
import type {
    TickerHistory,
    TickerInfo,
    TickersSequence,
    TickerTimeoutHistory,
} from "@canvas/tickers";
import { CANVAS_APP_GAME_LAYER_ALIAS } from "@constants";
import { PixiError } from "@drincs/pixi-vn/core";
import type { Application, ApplicationOptions } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { type Devtools, initDevtools } from "@pixi/devtools";
import { logger } from "@utils/log-utility";
import { throttle } from "@utils/time-utility";
import sha1 from "crypto-js/sha1";

/**
 * This class is responsible for managing the canvas, the tickers, the events, and the window size and the children of the window.
 */
namespace CanvasManagerStatic {
    let _app: Application | undefined;
    /**
     * The Pixi.js application instance.
     * @throws {PixiError} when the canvas has not been initialized yet (i.e. before calling `Game.init()`).
     */
    export function app() {
        if (!_app) {
            logger.error("The canvas is not initialized");
            throw new PixiError("invalid_usage", "CanvasManagerStatic.app is undefined");
        }
        return _app;
    }
    export function gameLayer() {
        let layer = CanvasManagerStatic.app().stage.getChildByLabel(CANVAS_APP_GAME_LAYER_ALIAS);
        if (!layer) {
            layer = new PIXI.Container();
            layer.label = CANVAS_APP_GAME_LAYER_ALIAS;
            CanvasManagerStatic.app().stage.addChild(layer);
        }
        return layer;
    }
    /**
     * This is the div that have same size of the canvas.
     * This is useful to put interface elements.
     * You can use React or other framework to put elements in this div.
     */
    export let htmlLayers: HTMLElement[] = [];
    export let canvasWidth: number = 300;
    export let canvasHeight: number = 300;
    export let _isInitialized: boolean = false;

    export async function init(
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
            ...rest
        } = options || {};
        canvasWidth = width;
        canvasHeight = height;
        _app = new PIXI.Application();
        return _app
            .init({
                width,
                height,
                resolution,
                autoDensity,
                ...rest,
            })
            .then(() => {
                const {
                    app = _app,
                    extensions = [],
                    ...devtoolsOptionsRest
                } = devtoolsOptions || {};
                initDevtools({
                    app: app,
                    extensions: [additionalPositionsProperties, ...extensions],
                    ...devtoolsOptionsRest,
                });

                _isInitialized = true;
                // Manager.app.ticker.add(Manager.update)
                addCanvasIntoHTMLElement(element, id);
                // listen for the browser telling us that the screen size changed
                switch (resizeMode) {
                    case "contain": {
                        const throttledResize = throttle(() => resize(), 10);
                        new ResizeObserver(throttledResize).observe(element);
                        // call it manually once so we are sure we are the correct size after starting
                        resize();
                        break;
                    }
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
    function addCanvasIntoHTMLElement(element: HTMLElement, id: string) {
        if (_isInitialized) {
            element.appendChild(CanvasManagerStatic.app().canvas as HTMLCanvasElement);
            CanvasManagerStatic.app().canvas.id = id;
        } else {
            logger.error("GameWindowManager is not initialized");
        }
    }
    export function addHtmlLayer(
        id: string,
        element: HTMLElement,
        style: Pick<CSSStyleDeclaration, "position" | "pointerEvents"> = {
            position: "absolute",
            pointerEvents: "none",
        },
    ) {
        const div = document.createElement("div");
        div.setAttribute("id", id);
        div.style.position = style.position;
        div.style.pointerEvents = style.pointerEvents;
        const res = element.appendChild(div);
        htmlLayers.push(div);
        resize();
        return res;
    }
    export function removeHtmlLayer(id: string) {
        const div = htmlLayers.find((layer) => layer.id === id);
        if (div) {
            div.remove();
            htmlLayers = htmlLayers.filter((layer) => layer.id !== id);
        }
    }
    export function getHtmlLayer(id: string): HTMLElement | undefined {
        return htmlLayers.find((layer) => layer.id === id);
    }

    /* Resize Metods */

    /**
     * This method is called when the screen is resized.
     */
    async function resize(): Promise<void> {
        let container = CanvasManagerStatic.app().resizeTo;
        const style = CanvasManagerStatic.app().canvas.style;
        if (!(container instanceof HTMLElement)) {
            container = document.documentElement;
        }
        let containerWidth: number;
        let containerHeight: number;
        // If the container is the document body or the documentElement,
        // use the viewport size (documentElement or window) because
        // body.clientHeight can be affected by CSS/content and not
        // reflect the visible viewport height.
        if (container === document.body || container === document.documentElement) {
            containerWidth = document.documentElement.clientWidth || window.innerWidth;
            containerHeight = document.documentElement.clientHeight || window.innerHeight;
        } else {
            const rect = container.getBoundingClientRect();
            containerWidth = rect.width || container.clientWidth;
            containerHeight = rect.height || container.clientHeight;
        }
        const scale = Math.min(containerWidth / canvasWidth, containerHeight / canvasHeight);
        const screenWidth = Math.floor(scale * canvasWidth);
        const screenHeight = Math.floor(scale * canvasHeight);
        style.width = `${screenWidth}px`;
        style.height = `${screenHeight}px`;
        const horizontalMargin = (containerWidth - screenWidth) / 2;
        const verticalMargin = (containerHeight - screenHeight) / 2;
        style.marginLeft = `${horizontalMargin}px`;
        style.marginRight = `${horizontalMargin}px`;
        style.marginTop = `${verticalMargin}px`;
        style.marginBottom = `${verticalMargin}px`;

        htmlLayers.forEach((layer) => {
            layer.style.width = `${screenWidth}px`;
            layer.style.height = `${screenHeight}px`;
            layer.style.marginLeft = `${horizontalMargin}px`;
            layer.style.marginRight = `${horizontalMargin}px`;
            layer.style.marginTop = `${verticalMargin}px`;
            layer.style.marginBottom = `${verticalMargin}px`;
        });
    }

    /* Edit Canvas Elements Methods */

    /**
     * The order of the elements in the canvas, is determined by the zIndex.
     */
    export function childrenAliasesOrder(): string[] {
        return CanvasManagerStatic.gameLayer()
            .children.filter((child) => child.label)
            .sort(
                (a, b) =>
                    CanvasManagerStatic.gameLayer().getChildIndex(a) -
                    CanvasManagerStatic.gameLayer().getChildIndex(b),
            )
            .map((item) => item.label);
    }

    /** Edit Tickers Methods */

    export function currentTickersWithoutCreatedBySteps(): {
        [k: string]: TickerHistory<any>;
    } {
        return Object.fromEntries(
            Object.entries(CanvasManagerStatic._currentTickers)
                .filter(([_, info]) => !info.createdByTicketSteps)
                .map(([id, info]) => [
                    id,
                    {
                        id: info.ticker.alias,
                        args: info.ticker.args,
                        canvasElementAliases: info.ticker.canvasElementAliases,
                        priority: info.ticker.priority,
                        duration: info.ticker.duration,
                        paused: info.ticker.paused,
                    },
                ]),
        );
    }
    export const _currentTickers: Map<string, TickerInfo<any>> = new Map();
    export const _currentTickersSequence: Map<string, { [tickerId: string]: TickersSequence }> =
        new Map();
    export const _currentTickersTimeouts: Map<string, TickerTimeoutHistory> = new Map();
    export const _tickersToCompleteOnStepEnd: {
        tikersIds: { id: string }[];
        stepAlias: { id: string; alias: string }[];
    } = { tikersIds: [], stepAlias: [] };
    export function generateTickerId(...args: any[]): string {
        try {
            return `${sha1(JSON.stringify(args)).toString()}_${Math.random().toString(36).substring(7)}`;
        } catch (e) {
            throw new PixiError("not_json_serializable", `Error to generate ticker id: ${e}`);
        }
    }
    export function addTickerTimeoutInfo(
        aliases: string | string[],
        ticker: string,
        timeout: string,
        canBeDeletedBeforeEnd: boolean,
    ) {
        if (typeof aliases === "string") {
            aliases = [aliases];
        }
        CanvasManagerStatic._currentTickersTimeouts.set(timeout, {
            aliases: aliases,
            ticker: ticker,
            canBeDeletedBeforeEnd: canBeDeletedBeforeEnd,
        });
    }
    export function removeTickerTimeoutInfo(timeout: NodeJS.Timeout | string) {
        if (typeof timeout !== "string") {
            timeout = timeout.toString();
        }
        CanvasManagerStatic._currentTickersTimeouts.delete(timeout);
    }
    export function removeTickerTimeout(timeout: NodeJS.Timeout | string) {
        if (typeof timeout !== "string") {
            timeout = timeout.toString();
        }
        clearTimeout(Number(timeout));
        CanvasManagerStatic.removeTickerTimeoutInfo(timeout);
    }
    export function removeTickerTimeoutsByAlias(
        alias: string,
        checkCanBeDeletedBeforeEnd: boolean,
    ) {
        // todo
        CanvasManagerStatic._currentTickersTimeouts.forEach((tickerTimeout, timeout) => {
            const aliasesWithoutAliasToRemove = tickerTimeout.aliases.filter((t) => t !== alias);
            if (aliasesWithoutAliasToRemove.length === 0) {
                const canBeDeletedBeforeEnd = tickerTimeout.canBeDeletedBeforeEnd;
                if (!checkCanBeDeletedBeforeEnd || canBeDeletedBeforeEnd) {
                    CanvasManagerStatic.removeTickerTimeout(timeout);
                }
            } else {
                // aggiorna direttamente l'oggetto memorizzato nella Map
                tickerTimeout.aliases = aliasesWithoutAliasToRemove;
            }
        });
    }
}
export default CanvasManagerStatic;
