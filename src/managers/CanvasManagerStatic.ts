import { initDevtools } from '@pixi/devtools';
import sha1 from 'crypto-js/sha1';
import { Application, ApplicationOptions } from "pixi.js";
import CanvasBaseItem from "../classes/canvas/CanvasBaseItem";
import { asciiArtLog } from '../functions/easter-egg';
import { TickerHistory, TickersSteps, TickerTimeoutHistory } from "../interface";
import PauseTickerType from '../types/PauseTickerType';

/**
 * This class is responsible for managing the canvas, the tickers, the events, and the window size and the children of the window.
 */
export default class CanvasManagerStatic {
    private constructor() { }

    private static _app: Application | undefined = undefined
    static get app() {
        if (!CanvasManagerStatic._app) {
            throw new Error("[Pixi’VN] CanvasManagerStatic.app is undefined")
        }
        return CanvasManagerStatic._app
    }
    /**
     * This is the div that have same size of the canvas.
     * This is useful to put interface elements.
     * You can use React or other framework to put elements in this div.
     */
    static htmlLayout?: HTMLElement
    static canvasWidth: number = 300
    static canvasHeight: number = 300
    static _isInitialized: boolean = false

    static async initialize(element: HTMLElement, width: number, height: number, options?: Partial<ApplicationOptions>): Promise<void> {
        CanvasManagerStatic.canvasWidth = width
        CanvasManagerStatic.canvasHeight = height
        CanvasManagerStatic._app = new Application()
        return CanvasManagerStatic.app.init({
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            width: width,
            height: height,
            ...options
        }).then(() => {
            initDevtools({ app: CanvasManagerStatic.app });

            CanvasManagerStatic._isInitialized = true
            // Manager.app.ticker.add(Manager.update)
            CanvasManagerStatic.addCanvasIntoHTMLElement(element)
            // listen for the browser telling us that the screen size changed
            window.addEventListener("resize", CanvasManagerStatic.resize)

            // call it manually once so we are sure we are the correct size after starting
            CanvasManagerStatic.resize()

            asciiArtLog()
        });
    }
    /**
     * Add the canvas into a html element.
     * @param element it is the html element where I will put the canvas. Example: document.body
     */
    private static addCanvasIntoHTMLElement(element: HTMLElement) {
        if (CanvasManagerStatic._isInitialized) {
            element.appendChild(CanvasManagerStatic.app.canvas as HTMLCanvasElement)
        }
        else {
            console.error("[Pixi’VN] GameWindowManager is not initialized")
        }
    }
    static initializeHTMLLayout(element: HTMLElement) {
        let div = document.createElement('div')
        div.style.position = 'absolute'
        div.style.pointerEvents = 'none'
        element.appendChild(div)
        CanvasManagerStatic.htmlLayout = div
        CanvasManagerStatic.resize()
    }

    /* Resize Metods */

    /**
     * This method returns the scale of the screen.
     */
    private static get screenScale() {
        let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        let screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        return Math.min(screenWidth / CanvasManagerStatic.canvasWidth, screenHeight / CanvasManagerStatic.canvasHeight)
    }
    /**
     * This method returns the width of the screen enlarged by the scale.
     */
    private static get screenWidth() {
        return Math.floor(CanvasManagerStatic.screenScale * CanvasManagerStatic.canvasWidth)
    }
    /**
     * This method returns the height of the screen enlarged by the scale.
     */
    private static get screenHeight() {
        return Math.floor(CanvasManagerStatic.screenScale * CanvasManagerStatic.canvasHeight)
    }
    /**
     * This method returns the horizontal margin of the screen.
     */
    private static get horizontalMargin() {
        let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        return (screenWidth - CanvasManagerStatic.screenWidth) / 2
    }
    /**
     * This method returns the vertical margin of the screen.
     */
    private static get verticalMargin() {
        let screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        return (screenHeight - CanvasManagerStatic.screenHeight) / 2
    }
    /**
     * This method is called when the screen is resized.
     */
    private static resize(): void {
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

        if (CanvasManagerStatic.htmlLayout) {
            CanvasManagerStatic.htmlLayout.style.width = `${CanvasManagerStatic.screenWidth}px`
            CanvasManagerStatic.htmlLayout.style.height = `${CanvasManagerStatic.screenHeight}px`
            CanvasManagerStatic.htmlLayout.style.marginLeft = `${CanvasManagerStatic.horizontalMargin}px`
            CanvasManagerStatic.htmlLayout.style.marginRight = `${CanvasManagerStatic.horizontalMargin}px`
            CanvasManagerStatic.htmlLayout.style.marginTop = `${CanvasManagerStatic.verticalMargin}px`
            CanvasManagerStatic.htmlLayout.style.marginBottom = `${CanvasManagerStatic.verticalMargin}px`
        }
    }

    /* Edit Canvas Elements Methods */

    static _children: { [alias: string]: CanvasBaseItem<any> } = {}
    /**
     * The order of the elements in the canvas, is determined by the zIndex.
     */
    static get childrenAliasesOrder(): string[] {
        return Object
            .entries(CanvasManagerStatic._children)
            .sort((a, b) => CanvasManagerStatic.app.stage.getChildIndex(a[1]) - CanvasManagerStatic.app.stage.getChildIndex(b[1]))
            .map(([alias, _]) => alias)
    }

    /** Edit Tickers Methods */

    static get currentTickersWithoutCreatedBySteps() {
        return Object.fromEntries(Object.entries(CanvasManagerStatic._currentTickers).filter(([_, ticker]) => !ticker.createdByTicketSteps))
    }
    static _currentTickers: { [id: string]: TickerHistory<any> } = {}
    static _currentTickersSteps: { [alias: string]: { [tickerId: string]: TickersSteps } } = {}
    static _currentTickersTimeouts: { [timeout: string]: TickerTimeoutHistory } = {}
    static _tickersMustBeCompletedBeforeNextStep: {
        tikersIds: { id: string }[],
        stepAlias: { id: string, alias: string }[],
    } = { tikersIds: [], stepAlias: [] }
    static generateTickerId(tickerData: TickerHistory<any> | TickersSteps): string {
        try {
            return sha1(JSON.stringify(tickerData)).toString() + "_" + Math.random().toString(36).substring(7)
        }
        catch (e) {
            throw new Error(`[Pixi’VN] Error to generate ticker id: ${e}`)
        }
    }
    static addTickerTimeoutInfo(aliases: string | string[], ticker: string, timeout: string, canBeDeletedBeforeEnd: boolean) {
        if (typeof aliases === "string") {
            aliases = [aliases]
        }
        CanvasManagerStatic._currentTickersTimeouts[timeout] = {
            aliases: aliases,
            ticker: ticker,
            canBeDeletedBeforeEnd: canBeDeletedBeforeEnd
        }
    }
    static removeTickerTimeoutInfo(timeout: NodeJS.Timeout | string) {
        if (typeof timeout !== "string") {
            timeout = timeout.toString()
        }
        if (CanvasManagerStatic._currentTickersTimeouts[timeout]) {
            delete CanvasManagerStatic._currentTickersTimeouts[timeout]
        }
    }
    static removeTickerTimeout(timeout: NodeJS.Timeout | string) {
        if (typeof timeout !== "string") {
            timeout = timeout.toString()
        }
        clearTimeout(Number(timeout))
        CanvasManagerStatic.removeTickerTimeoutInfo(timeout)
    }
    static removeTickerTimeoutsByAlias(alias: string, checkCanBeDeletedBeforeEnd: boolean) { // todo
        Object.entries(CanvasManagerStatic._currentTickersTimeouts).forEach(([timeout, tickerTimeout]) => {
            let aliasesWithoutAliasToRemove = tickerTimeout.aliases.filter((t) => t !== alias)
            if (aliasesWithoutAliasToRemove.length === 0) {
                let canBeDeletedBeforeEnd = tickerTimeout.canBeDeletedBeforeEnd
                if (!checkCanBeDeletedBeforeEnd || canBeDeletedBeforeEnd) {
                    CanvasManagerStatic.removeTickerTimeout(timeout)
                }
            }
            else {
                CanvasManagerStatic._currentTickersTimeouts[timeout].aliases = aliasesWithoutAliasToRemove
            }
        })
    }

    static _tickersOnPause: { [alias: string]: PauseTickerType } = {}
}
