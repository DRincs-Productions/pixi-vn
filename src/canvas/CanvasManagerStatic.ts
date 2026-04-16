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

let _app: Application | undefined = undefined;

function addCanvasIntoHTMLElement(element: HTMLElement, id: string) {
    if (CanvasManagerStatic._isInitialized) {
        element.appendChild(CanvasManagerStatic.app().canvas as HTMLCanvasElement);
        CanvasManagerStatic.app().canvas.id = id;
    } else {
        logger.error("GameWindowManager is not initialized");
    }
}

async function resize(): Promise<void> {
    const canvasWidth = CanvasManagerStatic.canvasWidth;
    const canvasHeight = CanvasManagerStatic.canvasHeight;
    let container = CanvasManagerStatic.app().resizeTo;
    const style = CanvasManagerStatic.app().canvas.style;
    if (!(container instanceof HTMLElement)) {
        container = document.documentElement;
    }
    let containerWidth: number;
    let containerHeight: number;
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

    CanvasManagerStatic.htmlLayers.forEach((layer) => {
        layer.style.width = `${screenWidth}px`;
        layer.style.height = `${screenHeight}px`;
        layer.style.marginLeft = `${horizontalMargin}px`;
        layer.style.marginRight = `${horizontalMargin}px`;
        layer.style.marginTop = `${verticalMargin}px`;
        layer.style.marginBottom = `${verticalMargin}px`;
    });
}

/**
 * This namespace is responsible for managing the canvas, the tickers, the events, and the window size and the children of the window.
 */
namespace CanvasManagerStatic {
    export let htmlLayers: HTMLElement[] = [];
    export let canvasWidth: number = 300;
    export let canvasHeight: number = 300;
    export let _isInitialized: boolean = false;

    export function app(): Application {
        if (!_app) {
            logger.error("The canvas is not initialized");
            throw new PixiError("invalid_usage", "CanvasManagerStatic.app is undefined");
        }
        return _app;
    }
    export function gameLayer() {
        let layer = app().stage.getChildByLabel(CANVAS_APP_GAME_LAYER_ALIAS);
        if (!layer) {
            layer = new PIXI.Container();
            layer.label = CANVAS_APP_GAME_LAYER_ALIAS;
            app().stage.addChild(layer);
        }
        return layer;
    }

    export async function init(
        element: HTMLElement,
        options?: Partial<ApplicationOptions> & {
            id?: string;
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
        return app()
            .init({
                width,
                height,
                resolution,
                autoDensity,
                ...rest,
            })
            .then(() => {
                const {
                    app: devApp = app(),
                    extensions = [],
                    ...devtoolsOptionsRest
                } = devtoolsOptions || {};
                initDevtools({
                    app: devApp,
                    extensions: [additionalPositionsProperties, ...extensions],
                    ...devtoolsOptionsRest,
                });

                _isInitialized = true;
                addCanvasIntoHTMLElement(element, id);
                switch (resizeMode) {
                    case "contain": {
                        const throttledResize = throttle(() => resize(), 10);
                        new ResizeObserver(throttledResize).observe(element);
                        resize();
                        break;
                    }
                    default:
                        break;
                }
                gameLayer();
            });
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

    export function childrenAliasesOrder(): string[] {
        return gameLayer()
            .children.filter((child) => child.label)
            .sort(
                (a, b) =>
                    gameLayer().getChildIndex(a) - gameLayer().getChildIndex(b),
            )
            .map((item) => item.label);
    }

    export function currentTickersWithoutCreatedBySteps(): {
        [k: string]: TickerHistory<any>;
    } {
        return Object.fromEntries(
            Object.entries(_currentTickers)
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

    export let _currentTickers: { [id: string]: TickerInfo<any> } = {};
    export let _currentTickersSequence: { [alias: string]: { [tickerId: string]: TickersSequence } } = {};
    export const _currentTickersTimeouts: { [timeout: string]: TickerTimeoutHistory } = {};
    export let _tickersToCompleteOnStepEnd: {
        tikersIds: { id: string }[];
        stepAlias: { id: string; alias: string }[];
    } = { tikersIds: [], stepAlias: [] };

    export function generateTickerId(...args: any[]): string {
        try {
            return (
                sha1(JSON.stringify(args)).toString() +
                "_" +
                Math.random().toString(36).substring(7)
            );
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
        _currentTickersTimeouts[timeout] = {
            aliases: aliases,
            ticker: ticker,
            canBeDeletedBeforeEnd: canBeDeletedBeforeEnd,
        };
    }
    export function removeTickerTimeoutInfo(timeout: NodeJS.Timeout | string) {
        if (typeof timeout !== "string") {
            timeout = timeout.toString();
        }
        if (_currentTickersTimeouts[timeout]) {
            delete _currentTickersTimeouts[timeout];
        }
    }
    export function removeTickerTimeout(timeout: NodeJS.Timeout | string) {
        if (typeof timeout !== "string") {
            timeout = timeout.toString();
        }
        clearTimeout(Number(timeout));
        removeTickerTimeoutInfo(timeout);
    }
    export function removeTickerTimeoutsByAlias(alias: string, checkCanBeDeletedBeforeEnd: boolean) {
        Object.entries(_currentTickersTimeouts).forEach(([timeout, tickerTimeout]) => {
            const aliasesWithoutAliasToRemove = tickerTimeout.aliases.filter((t) => t !== alias);
            if (aliasesWithoutAliasToRemove.length === 0) {
                const canBeDeletedBeforeEnd = tickerTimeout.canBeDeletedBeforeEnd;
                if (!checkCanBeDeletedBeforeEnd || canBeDeletedBeforeEnd) {
                    removeTickerTimeout(timeout);
                }
            } else {
                _currentTickersTimeouts[timeout].aliases = aliasesWithoutAliasToRemove;
            }
        });
    }
}
export default CanvasManagerStatic;
