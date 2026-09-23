import additionalPositionsProperties from "@canvas/pixi-devtools/additionalPositionsProperties";
import { CANVAS_APP_GAME_LAYER_ALIAS } from "@constants";
import { PixiError } from "@drincs/pixi-vn/core";
import type { Application, ApplicationOptions } from "@drincs/pixi-vn/pixi.js";
import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import { type Devtools, initDevtools } from "@pixi/devtools";
import { logger } from "@utils/log-utility";
import { throttle } from "@utils/time-utility";
/**
 * This class is responsible for managing the canvas, the tickers, the events, and the window size and the children of the window.
 */
export default class CanvasManagerStatic {
    private constructor() {}

    private static _app: Application | undefined = undefined;
    /**
     * The Pixi.js application instance.
     * @throws {PixiError} when the canvas has not been initialized yet (i.e. before calling `Game.init()`).
     */
    static get app() {
        if (!CanvasManagerStatic._app) {
            logger.error("The canvas is not initialized");
            throw new PixiError("invalid_usage", "CanvasManagerStatic.app is undefined");
        }
        return CanvasManagerStatic._app;
    }
    static get gameLayer() {
        let layer = CanvasManagerStatic.app.stage.getChildByLabel(CANVAS_APP_GAME_LAYER_ALIAS);
        if (!layer) {
            layer = new PIXI.Container();
            layer.label = CANVAS_APP_GAME_LAYER_ALIAS;
            CanvasManagerStatic.app.stage.addChild(layer);
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
            ...rest
        } = options || {};
        CanvasManagerStatic.canvasWidth = width;
        CanvasManagerStatic.canvasHeight = height;
        CanvasManagerStatic._app = new PIXI.Application();
        return CanvasManagerStatic.app
            .init({
                width,
                height,
                resolution,
                autoDensity,
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
                    case "contain": {
                        const throttledResize = throttle(async () => {
                            requestAnimationFrame(() => CanvasManagerStatic.resize());
                        }, 10);
                        new ResizeObserver(throttledResize).observe(element);
                        // call it manually once so we are sure we are the correct size after starting
                        CanvasManagerStatic.resize();
                        // some systems report the viewport size with a slight delay after init
                        setTimeout(() => CanvasManagerStatic.resize(), 750);
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
        style: Partial<Pick<CSSStyleDeclaration, "position" | "pointerEvents" | "userSelect">> = {},
    ) {
        const { position = "absolute", pointerEvents = "none", userSelect = "none" } = style;
        const div = document.createElement("div");
        div.setAttribute("id", id);
        div.style.position = position;
        div.style.pointerEvents = pointerEvents;
        div.style.userSelect = userSelect;
        const res = element.appendChild(div);
        CanvasManagerStatic.htmlLayers.push(div);
        CanvasManagerStatic.resize();
        return res;
    }
    static removeHtmlLayer(id: string) {
        const div = CanvasManagerStatic.htmlLayers.find((layer) => layer.id === id);
        if (div) {
            div.remove();
            CanvasManagerStatic.htmlLayers = CanvasManagerStatic.htmlLayers.filter(
                (layer) => layer.id !== id,
            );
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
        const style = CanvasManagerStatic.app.canvas.style;
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

        CanvasManagerStatic.htmlLayers.forEach((layer) => {
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
    static get childrenAliasesOrder(): string[] {
        return CanvasManagerStatic.gameLayer.children
            .filter((child) => child.label)
            .sort(
                (a, b) =>
                    CanvasManagerStatic.gameLayer.getChildIndex(a) -
                    CanvasManagerStatic.gameLayer.getChildIndex(b),
            )
            .map((item) => item.label);
    }
}
