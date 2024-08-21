import { initDevtools } from '@pixi/devtools';
import sha1 from 'crypto-js/sha1';
import * as PIXI from "pixi.js";
import { ApplicationOptions, Container, Ticker } from "pixi.js";
import CanvasBase from "../classes/canvas/CanvasBase";
import TickerBase, { TickerArgsType } from "../classes/ticker/TickerBase";
import { Repeat } from "../constants";
import { geTickerInstanceById } from "../decorators/TickerDecorator";
import { asciiArtLog } from "../functions/EasterEgg";
import { createExportableElement } from "../functions/ExportUtility";
import { exportCanvasElement, importCanvasElement } from '../functions/canvas/CanvasMemoryUtility';
import { ExportedCanvas, ITicker, ITickersSteps, TickerHistory, TickerTimeoutHistory } from "../interface";
import { ITickersStep } from "../interface/ITickersSteps";
import { ICanvasBaseMemory } from "../interface/canvas";
import { PauseType } from "../types/PauseType";
import { RepeatType } from "../types/RepeatType";
import { TickerIdType } from "../types/TickerIdType";
import { tagToRemoveAfter } from '../types/ticker/TagToRemoveAfterType';

/**
 * This class is responsible for managing the canvas, the tickers, the events, and the window size and the children of the window.
 */
export default class GameWindowManager {
    private constructor() { }

    private static _app: PIXI.Application | undefined = undefined
    /**
     * The PIXI Application instance.
     * It not recommended to use this property directly.
     */
    static get app() {
        if (!GameWindowManager._app) {
            throw new Error("[Pixi'VN] GameWindowManager.app is undefined")
        }
        return GameWindowManager._app
    }
    private static _isInitialized: boolean = false
    /**
     * If the manager is initialized.
     */
    static get isInitialized() {
        return GameWindowManager._isInitialized
    }
    /**
     * This is the div that have same size of the canvas.
     * This is useful to put interface elements.
     * You can use React or other framework to put elements in this div.
     */
    static htmlLayout: HTMLElement
    static canvasWidth: number
    static canvasHeight: number
    static get screen() {
        return GameWindowManager.app.screen
    }

    /**
     * Initialize the PIXI Application and the interface div.
     * This method should be called before any other method.
     * @param element The html element where I will put the canvas. Example: document.body
     * @param width The width of the canvas
     * @param height The height of the canvas
     * @param options The options of PIXI Application
     * @example
     * ```typescript
     * const body = document.body
     * if (!body) {
     *     throw new Error('body element not found')
     * }
     * await canvas.initialize(body, 1920, 1080, {
     *     backgroundColor: "#303030"
     * })
     * ```
     */
    public static async initialize(element: HTMLElement, width: number, height: number, options?: Partial<ApplicationOptions>): Promise<void> {
        GameWindowManager.canvasWidth = width
        GameWindowManager.canvasHeight = height
        GameWindowManager._app = new PIXI.Application()
        return GameWindowManager.app.init({
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            width: width,
            height: height,
            ...options
        }).then(() => {
            initDevtools({ app: GameWindowManager._app });

            GameWindowManager._isInitialized = true
            // Manager.app.ticker.add(Manager.update)
            this.addCanvasIntoHTMLElement(element)
            // listen for the browser telling us that the screen size changed
            window.addEventListener("resize", GameWindowManager.resize)

            // call it manually once so we are sure we are the correct size after starting
            GameWindowManager.resize()

            asciiArtLog()
        });
    }

    /**
     * Add the canvas into a html element.
     * @param element it is the html element where I will put the canvas. Example: document.body
     */
    private static addCanvasIntoHTMLElement(element: HTMLElement) {
        if (GameWindowManager.isInitialized) {
            element.appendChild(GameWindowManager.app.canvas as HTMLCanvasElement)
        }
        else {
            console.error("[Pixi'VN] GameWindowManager is not initialized")
        }
    }
    /**
     * Initialize the interface div and add it into a html element.
     * @param element it is the html element where I will put the interface div. Example: document.getElementById('root')
     * @example
     * ```tsx
     * const root = document.getElementById('root')
     * if (!root) {
     *     throw new Error('root element not found')
     * }
     * canvas.initializeHTMLLayout(root)
     * const reactRoot = createRoot(canvas.htmlLayout)
     * reactRoot.render(
     *     <App />
     * )
     * ```
     */
    public static initializeHTMLLayout(element: HTMLElement) {
        let div = document.createElement('div')
        div.style.position = 'absolute'
        div.style.pointerEvents = 'none'
        element.appendChild(div)
        GameWindowManager.htmlLayout = div
        GameWindowManager.resize()
    }

    /* Resize Metods */

    /**
     * This method returns the scale of the screen.
     */
    public static get screenScale() {
        let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        let screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        return Math.min(screenWidth / GameWindowManager.canvasWidth, screenHeight / GameWindowManager.canvasHeight)
    }
    /**
     * This method returns the width of the screen enlarged by the scale.
     */
    public static get screenWidth() {
        return Math.floor(GameWindowManager.screenScale * GameWindowManager.canvasWidth)
    }
    /**
     * This method returns the height of the screen enlarged by the scale.
     */
    public static get screenHeight() {
        return Math.floor(GameWindowManager.screenScale * GameWindowManager.canvasHeight)
    }
    /**
     * This method returns the horizontal margin of the screen.
     */
    public static get horizontalMargin() {
        let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        return (screenWidth - GameWindowManager.screenWidth) / 2
    }
    /**
     * This method returns the vertical margin of the screen.
     */
    public static get verticalMargin() {
        let screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        return (screenHeight - GameWindowManager.screenHeight) / 2
    }
    /**
     * This method is called when the screen is resized.
     */
    private static resize(): void {
        // now we use css trickery to set the sizes and margins
        if (GameWindowManager.isInitialized) {
            let style = GameWindowManager.app.canvas.style;
            style.width = `${GameWindowManager.screenWidth}px`;
            style.height = `${GameWindowManager.screenHeight}px`;
            (style as any).marginLeft = `${GameWindowManager.horizontalMargin}px`;
            (style as any).marginRight = `${GameWindowManager.horizontalMargin}px`;
            (style as any).marginTop = `${GameWindowManager.verticalMargin}px`;
            (style as any).marginBottom = `${GameWindowManager.verticalMargin}px`;
        }

        if (GameWindowManager.htmlLayout) {
            GameWindowManager.htmlLayout.style.width = `${GameWindowManager.screenWidth}px`
            GameWindowManager.htmlLayout.style.height = `${GameWindowManager.screenHeight}px`
            GameWindowManager.htmlLayout.style.marginLeft = `${GameWindowManager.horizontalMargin}px`
            GameWindowManager.htmlLayout.style.marginRight = `${GameWindowManager.horizontalMargin}px`
            GameWindowManager.htmlLayout.style.marginTop = `${GameWindowManager.verticalMargin}px`
            GameWindowManager.htmlLayout.style.marginBottom = `${GameWindowManager.verticalMargin}px`
        }
    }

    /* Edit Canvas Elements Methods */

    /**
     * This is a dictionary that contains all Canvas Elements of Canvas, currently.
     */
    static get currentCanvasElements() {
        return GameWindowManager._children
    }
    private static _children: { [alias: string]: CanvasBase<any> } = {}
    /**
     * The order of the children aliases.
     */
    private static childrenTagsOrder: string[] = []
    /**
     * Add a canvas element to the canvas.
     * If there is a canvas element with the same alias, it will be removed.
     * @param alias The alias of the canvas element.
     * @param canvasElement The canvas elements to be added.
     * @example
     * ```typescript
     * const texture = await Assets.load('https://pixijs.com/assets/bunny.png');
     * const sprite = CanvasSprite.from(texture);
     * canvas.add("bunny", sprite);
     * ```
     */
    public static add(alias: string, canvasElement: CanvasBase<any>) {
        if (GameWindowManager._children[alias]) {
            GameWindowManager.remove(alias)
        }
        GameWindowManager.app.stage.addChild(canvasElement)
        GameWindowManager._children[alias] = canvasElement
        GameWindowManager.childrenTagsOrder.push(alias)
    }
    /**
     * @deprecated use canvas.add
     */
    public static addCanvasElement(alias: string, canvasElement: CanvasBase<any>) {
        GameWindowManager.add(alias, canvasElement)
    }
    /**
     * Remove a canvas element from the canvas.
     * And remove all tickers that are not connected to any canvas element.
     * @param alias The alias of the canvas element to be removed.
     * @returns 
     * @example
     * ```typescript
     * canvas.remove("bunny");
     * ```
     */
    public static remove(alias: string | string[]) {
        if (typeof alias === "string") {
            alias = [alias]
        }
        alias.forEach((alias) => {
            if (GameWindowManager._children[alias]) {
                GameWindowManager.app.stage.removeChild(GameWindowManager._children[alias])
                delete GameWindowManager._children[alias]
                GameWindowManager.removeTickerByCanvasElement(alias)
            }
        })
        GameWindowManager.childrenTagsOrder = GameWindowManager.childrenTagsOrder.filter((t) => !alias.includes(t))
    }
    /**
     * @deprecated use canvas.remove
     */
    public static removeCanvasElement(alias: string | string[]) {
        GameWindowManager.remove(alias)
    }
    /**
     * Get a canvas element by the alias.
     * @param alias The alias of the canvas element.
     * @returns The canvas element.
     * @example
     * ```typescript
     * const sprite = canvas.find<CanvasSprite>("bunny");
     * ```
     */
    public static find<T extends CanvasBase<any>>(alias: string): T | undefined {
        return GameWindowManager._children[alias] as T | undefined
    }
    /**
     * @deprecated use canvas.find
     */
    public static getCanvasElement<T extends CanvasBase<any>>(alias: string): T | undefined {
        return GameWindowManager.find<T>(alias)
    }
    /**
     * Check if a DisplayObject is on the canvas.
     * @param pixiElement The DisplayObject to be checked.
     * @returns If the DisplayObject is on the canvas.
     */
    public static canvasElementIsOnCanvas<T extends Container>(pixiElement: T) {
        return GameWindowManager.app.stage.children.includes(pixiElement)
    }
    /**
     * Remove all canvas elements from the canvas.
     * And remove all tickers that are not connected to any canvas element.
     */
    public static removeAll() {
        GameWindowManager.app.stage.removeChildren()
        GameWindowManager._children = {}
        GameWindowManager.childrenTagsOrder = []
        GameWindowManager.removeAllTickers()
    }
    /**
     * Edit the alias of a canvas element.
     * @param oldTag The old alias of the canvas element.
     * @param newTag The new alias of the canvas element.
     */
    public static editAlias(oldTag: string, newTag: string) {
        if (GameWindowManager._children[oldTag]) {
            GameWindowManager._children[newTag] = GameWindowManager._children[oldTag]
            delete GameWindowManager._children[oldTag]
        }
        if (GameWindowManager._currentTickersSteps[oldTag]) {
            GameWindowManager._currentTickersSteps[newTag] = GameWindowManager._currentTickersSteps[oldTag]
            delete GameWindowManager._currentTickersSteps[oldTag]
        }
        for (let id in GameWindowManager._currentTickers) {
            let ticker = GameWindowManager._currentTickers[id]
            if (ticker.canvasElementTags.includes(oldTag)) {
                ticker.canvasElementTags = ticker.canvasElementTags.map((t) => t === oldTag ? newTag : t)
                if (ticker.args.hasOwnProperty(tagToRemoveAfter)) {
                    let tagToRemoveAfter: string | string[] = ticker.args.tagToRemoveAfter
                    if (typeof tagToRemoveAfter === "string") {
                        tagToRemoveAfter = [tagToRemoveAfter]
                    }
                    if (Array.isArray(tagToRemoveAfter)) {
                        ticker.args.tagToRemoveAfter = tagToRemoveAfter.map((t) => t === oldTag ? newTag : t)
                    }
                }
            }
        }
        for (let timeout in GameWindowManager._currentTickersTimeouts) {
            let TickerTimeout = GameWindowManager._currentTickersTimeouts[timeout]
            if (TickerTimeout.aliases.includes(oldTag)) {
                TickerTimeout.aliases = TickerTimeout.aliases.map((t) => t === oldTag ? newTag : t)
            }
        }
    }

    /** Edit Tickers Methods */

    /**
     * Currently tickers that are running.
     */
    public static get currentTickers() {
        return GameWindowManager._currentTickers
    }
    public static get currentTickersList() {
        return Object.values(GameWindowManager._currentTickers)
    }
    private static get currentTickersWithoutCreatedBySteps() {
        return Object.fromEntries(Object.entries(GameWindowManager._currentTickers).filter(([_, ticker]) => !ticker.createdByTicketStepsId))
    }
    private static _currentTickers: { [id: string]: TickerHistory<any> } = {}
    /**
     * The steps of the tickers
     */
    public static get currentTickersSteps() {
        return GameWindowManager._currentTickersSteps
    }
    private static _currentTickersSteps: { [alias: string]: ITickersSteps } = {}
    private static _currentTickersTimeouts: { [timeout: string]: TickerTimeoutHistory } = {}
    private static generateTickerId(tickerData: TickerHistory<any>): string {
        try {
            return sha1(JSON.stringify(tickerData)).toString() + "_" + Math.random().toString(36).substring(7)
        }
        catch (e) {
            throw new Error(`[Pixi'VN] Error to generate ticker id: ${e}`)
        }
    }
    /**
     * Run a ticker. You can run multiple addTicker with the same alias and different tickerClasses.
     * If you run a ticker with the same alias and tickerClass, the old ticker will be removed.
     * If already exists a sequence of tickers with the same alias, it will be removed.
     * @param canvasEslementTag The alias of the canvas element that will use the ticker.
     * @param ticker The ticker class to be run.
     * @param args The arguments to be used in the ticker.
     * @param duration The time to be used in the ticker. This number is in seconds. If it is undefined, the ticker will run forever.
     * @param priority The priority to be used in the ticker.
     * @returns 
     * @example
     * ```typescript
     * canvas.addTicker("alien", new RotateTicker({ speed: 0.2 }))
     * ```
     */
    static addTicker<TArgs extends TickerArgsType>(canvasElementTag: string | string[], ticker: TickerBase<TArgs>) {
        let tickerId: TickerIdType = ticker.id
        if (typeof canvasElementTag === "string") {
            canvasElementTag = [canvasElementTag]
        }
        if (!geTickerInstanceById<TArgs>(tickerId, ticker.args, ticker.duration, ticker.priority)) {
            console.error(`[Pixi'VN] Ticker ${tickerId} not found`)
            return
        }
        let tickerHistory: TickerHistory<TArgs> = {
            fn: () => { },
            id: tickerId,
            args: createExportableElement(ticker.args),
            canvasElementTags: canvasElementTag,
            priority: ticker.priority,
            duration: ticker.duration,
        }
        let id = GameWindowManager.generateTickerId(tickerHistory)
        GameWindowManager.pushTicker(id, tickerHistory, ticker)
        if (ticker.duration) {
            let timeout = setTimeout(() => {
                GameWindowManager.removeTickerTimeoutInfo(timeout)
                let tickerTimeoutInfo = GameWindowManager._currentTickersTimeouts[timeout.toString()]
                if (tickerTimeoutInfo) {
                    GameWindowManager.removeTicker(id)
                }
            }, ticker.duration * 1000);
            GameWindowManager.addTickerTimeoutInfo(canvasElementTag, tickerId, timeout.toString(), true)
        }
    }
    private static pushTicker<TArgs extends TickerArgsType>(id: string, tickerData: TickerHistory<TArgs>, ticker: TickerBase<TArgs>) {
        GameWindowManager.removeAssociationBetweenTickerCanvasElement(tickerData.canvasElementTags, ticker)
        GameWindowManager._currentTickers[id] = tickerData
        tickerData.fn = (t: Ticker) => {
            let data = GameWindowManager._currentTickers[id]
            if (data) {
                ticker?.fn(t, data.args, data.canvasElementTags, id)
            }
        }
        GameWindowManager.app.ticker.add(tickerData.fn, undefined, tickerData.priority)
    }
    /**
     * Run a sequence of tickers. If exists a ticker steps with the same alias, it will be removed.
     * @param alias The alias of canvas element that will use the tickers.
     * @param steps The steps of the tickers.
     * @param currentStepNumber The current step number. It is used to continue the sequence of tickers.
     * @returns
     * @example
     * ```typescript
     * canvas.addTickersSteps("alien", [
     *     new RotateTicker({ speed: 0.1, clockwise: true }, 2), // 2 seconds
     *     Pause(1), // 1 second
     *     new RotateTicker({ speed: 0.2, clockwise: false }, 2),
     *     Repeat,
     * ])
     * ```
     */
    static addTickersSteps<TArgs extends TickerArgsType>(alias: string, steps: (ITicker<TArgs> | RepeatType | PauseType)[], currentStepNumber = 0) {
        if (steps.length == 0) {
            console.warn("[Pixi'VN] The steps of the tickers is empty")
            return
        }
        GameWindowManager.removeTickerStepByCanvasElement(alias)
        GameWindowManager._currentTickersSteps[alias] = {
            currentStepNumber: currentStepNumber,
            steps: steps.map((step) => {
                if (step === Repeat) {
                    return step
                }
                if (step.hasOwnProperty("type") && (step as PauseType).type === "pause") {
                    return step as PauseType
                }
                let tickerId = (step as ITicker<TArgs>).id
                return {
                    ticker: tickerId,
                    args: createExportableElement((step as ITicker<TArgs>).args),
                    duration: step.duration,
                }
            })
        }
        GameWindowManager.runTickersSteps(alias)
    }
    private static restoneTickersSteps(data: { [alias: string]: ITickersSteps }) {
        for (let alias in data) {
            let steps = data[alias]
            GameWindowManager._currentTickersSteps[alias] = steps
            GameWindowManager.runTickersSteps(alias)
        }
    }
    private static runTickersSteps<TArgs extends TickerArgsType>(alias: string) {
        let step = GameWindowManager._currentTickersSteps[alias].steps[GameWindowManager._currentTickersSteps[alias].currentStepNumber]
        if (step === Repeat) {
            step = GameWindowManager._currentTickersSteps[alias].steps[0]
            GameWindowManager._currentTickersSteps[alias].currentStepNumber = 0
            if (step === Repeat) {
                console.error("[Pixi'VN] TikersSteps has a RepeatType in the first step")
                return
            }
        }
        if (step.hasOwnProperty("type") && (step as PauseType).type === "pause") {
            let timeout = setTimeout(() => {
                let tickerTimeoutInfo = GameWindowManager._currentTickersTimeouts[timeout.toString()]
                if (tickerTimeoutInfo) {
                    tickerTimeoutInfo.aliases.forEach((alias) => {
                        GameWindowManager.nextTickerStep(alias)
                    })
                }
                GameWindowManager.removeTickerTimeoutInfo(timeout)
            }, (step as PauseType).duration * 1000);
            GameWindowManager.addTickerTimeoutInfo(alias, "steps", timeout.toString(), false)
            return
        }
        let ticker = geTickerInstanceById<TArgs>((step as ITickersStep<TArgs>).ticker, (step as ITickersStep<TArgs>).args, step.duration, (step as ITickersStep<TArgs>).priority)
        if (!ticker) {
            console.error(`[Pixi'VN] Ticker ${(step as ITickersStep<TArgs>).ticker} not found`)
            return
        }
        let tickerName: TickerIdType = ticker.id
        let tickerHistory: TickerHistory<TArgs> = {
            fn: () => { },
            id: tickerName,
            args: createExportableElement(ticker.args),
            canvasElementTags: [alias],
            priority: ticker.priority,
            duration: ticker.duration,
            createdByTicketStepsId: alias,
        }
        let id = GameWindowManager.generateTickerId(tickerHistory)
        GameWindowManager.pushTicker(id, tickerHistory, ticker)
        if (ticker.duration) {
            let timeout = setTimeout(() => {
                let tickerTimeoutInfo = GameWindowManager._currentTickersTimeouts[timeout.toString()]
                if (tickerTimeoutInfo) {
                    GameWindowManager.removeTicker(id)
                    tickerTimeoutInfo.aliases.forEach((alias) => {
                        GameWindowManager.nextTickerStep(alias)
                    })
                }
                GameWindowManager.removeTickerTimeoutInfo(timeout)
            }, ticker.duration * 1000);
            GameWindowManager.addTickerTimeoutInfo(alias, tickerName, timeout.toString(), false)
        }
    }
    private static nextTickerStep(alias: string) {
        if (GameWindowManager._currentTickersSteps[alias]) {
            let steps = GameWindowManager._currentTickersSteps[alias]
            if (steps.currentStepNumber + 1 < steps.steps.length) {
                steps.currentStepNumber++
                GameWindowManager._currentTickersSteps[alias] = steps
                GameWindowManager.runTickersSteps(alias)
            }
            else {
                GameWindowManager.removeTickerStepByCanvasElement(alias)
            }
        }
    }
    public static onEndOfTicker(canvasElementTags: string | string[], ticker: typeof TickerBase<any> | TickerBase<any> | string, canvasElementTagsToDelete: string | string[], tickerId: string) {
        let tickerData = GameWindowManager._currentTickers[tickerId]
        GameWindowManager.removeAssociationBetweenTickerCanvasElement(canvasElementTags, ticker)
        GameWindowManager.remove(canvasElementTagsToDelete)
        if (tickerData) {
            GameWindowManager.removeTicker(tickerId)
            if (tickerData.duration == undefined && tickerData.createdByTicketStepsId) {
                GameWindowManager.nextTickerStep(tickerData.createdByTicketStepsId)
            }
        }
    }
    /**
     * Remove a connection between a canvas element and a ticker.
     * And remove the ticker if there is no canvas element connected to it.
     * @param alias The alias of the canvas element that will use the ticker.
     * @param ticker The ticker class to be removed.
     * @example
     * ```typescript
     * canvas.removeAssociationBetweenTickerCanvasElement("alien", RotateTicker)
     * ```
     */
    public static removeAssociationBetweenTickerCanvasElement(alias: string | string[], ticker: typeof TickerBase<any> | TickerBase<any> | string) {
        let tickerId: TickerIdType
        if (typeof ticker === "string") {
            tickerId = ticker
        }
        else if (ticker instanceof TickerBase) {
            tickerId = ticker.id
        }
        else {
            tickerId = ticker.prototype.id
        }
        if (typeof alias === "string") {
            alias = [alias]
        }
        for (let id in GameWindowManager._currentTickers) {
            let ticker = GameWindowManager._currentTickers[id]
            if (ticker.id === tickerId) {
                GameWindowManager._currentTickers[id].canvasElementTags = ticker.canvasElementTags.filter((e) => !alias.includes(e))
            }
        }
        for (let timeout in GameWindowManager._currentTickersTimeouts) {
            let TickerTimeout = GameWindowManager._currentTickersTimeouts[timeout]
            if (TickerTimeout.ticker === tickerId && TickerTimeout.canBeDeletedBeforeEnd) {
                GameWindowManager._currentTickersTimeouts[timeout].aliases = TickerTimeout.aliases.filter((t) => !alias.includes(t))
            }
        }
        GameWindowManager.removeTickersWithoutAssociatedCanvasElement()
    }
    /**
     * Remove all tickers that are not connected to any existing canvas element.
     */
    private static removeTickersWithoutAssociatedCanvasElement() {
        for (let id in GameWindowManager._currentTickers) {
            let ticker = GameWindowManager._currentTickers[id]
            ticker.canvasElementTags = ticker.canvasElementTags.filter((e) => GameWindowManager._children[e])
            if (ticker.canvasElementTags.length === 0) {
                GameWindowManager.removeTicker(id)
            }
        }
        for (let alias in GameWindowManager._currentTickersSteps) {
            if (GameWindowManager._children[alias] === undefined) {
                delete GameWindowManager._currentTickersSteps[alias]
            }
        }
        Object.entries(GameWindowManager._currentTickersTimeouts).forEach(([timeout, { aliases: aliases }]) => {
            if (aliases.length === 0) {
                GameWindowManager.removeTickerTimeout(timeout)
            }
        })
    }
    private static addTickerTimeoutInfo(aliases: string | string[], ticker: string, timeout: string, canBeDeletedBeforeEnd: boolean) {
        if (typeof aliases === "string") {
            aliases = [aliases]
        }
        GameWindowManager._currentTickersTimeouts[timeout] = {
            aliases: aliases,
            ticker: ticker,
            canBeDeletedBeforeEnd: canBeDeletedBeforeEnd
        }
    }
    private static removeTickerTimeoutInfo(timeout: NodeJS.Timeout | string) {
        if (typeof timeout !== "string") {
            timeout = timeout.toString()
        }
        if (GameWindowManager._currentTickersTimeouts[timeout]) {
            delete GameWindowManager._currentTickersTimeouts[timeout]
        }
    }
    private static removeTickerTimeout(timeout: NodeJS.Timeout | string) {
        if (typeof timeout !== "string") {
            timeout = timeout.toString()
        }
        clearTimeout(Number(timeout))
        GameWindowManager.removeTickerTimeoutInfo(timeout)
    }
    private static removeTickerTimeoutsByTag(alias: string, checkCanBeDeletedBeforeEnd: boolean) {
        for (let timeout in GameWindowManager._currentTickersTimeouts) {
            let aliasesWithoutTagToRemove = GameWindowManager._currentTickersTimeouts[timeout].aliases.filter((t) => t !== alias)
            if (aliasesWithoutTagToRemove.length === 0) {
                let canBeDeletedBeforeEnd = GameWindowManager._currentTickersTimeouts[timeout].canBeDeletedBeforeEnd
                if (!checkCanBeDeletedBeforeEnd || canBeDeletedBeforeEnd) {
                    GameWindowManager.removeTickerTimeout(timeout)
                }
            }
            else {
                GameWindowManager._currentTickersTimeouts[timeout].aliases = aliasesWithoutTagToRemove
            }
        }
    }
    /**
     * Remove all tickers from the canvas.
     */
    public static removeAllTickers() {
        GameWindowManager._currentTickersSteps = {}
        Object.keys(GameWindowManager._currentTickers).forEach((id) => {
            GameWindowManager.removeTicker(id)
        })
        GameWindowManager._currentTickers = {}
        for (let timeout in GameWindowManager._currentTickersTimeouts) {
            GameWindowManager.removeTickerTimeout(timeout)
        }
    }
    /**
     * Remove all tickers from a canvas element.
     * @param alias The alias of the canvas element that will use the ticker.
     */
    private static removeTickerByCanvasElement(alias: string | string[]) {
        if (typeof alias === "string") {
            alias = [alias]
        }
        alias.forEach((alias) => {
            for (let id in GameWindowManager._currentTickers) {
                let ticker = GameWindowManager._currentTickers[id]
                if (ticker.canvasElementTags.includes(alias)) {
                    GameWindowManager.removeTicker(id)
                }
            }
            if (GameWindowManager._currentTickersSteps[alias]) {
                delete GameWindowManager._currentTickersSteps[alias]
            }
            GameWindowManager.removeTickerTimeoutsByTag(alias, false)
            delete GameWindowManager._currentTickersSteps[alias]
        })
    }
    private static removeTickerStepByCanvasElement(alias: string) {
        if (GameWindowManager._currentTickersSteps[alias]) {
            delete GameWindowManager._currentTickersSteps[alias]
        }
        for (let id in GameWindowManager._currentTickers) {
            let ticker = GameWindowManager._currentTickers[id]
            if (ticker.createdByTicketStepsId === alias) {
                GameWindowManager.removeTicker(id)
            }
        }
    }
    private static removeTicker(tickerId: string) {
        let ticker = GameWindowManager._currentTickers[tickerId]
        if (ticker) {
            if (ticker.args.hasOwnProperty(tagToRemoveAfter)) {
                let tagToRemoveAfter: string | string[] = ticker.args.tagToRemoveAfter
                GameWindowManager.remove(tagToRemoveAfter)
            }
            GameWindowManager.app.ticker.remove(ticker.fn)
            delete GameWindowManager._currentTickers[tickerId]
        }
    }

    /**
     * Clear the canvas and the tickers.
     */
    static clear() {
        GameWindowManager.removeAll()
    }

    /* Export and Import Methods */

    /**
     * Export the canvas and the tickers to a JSON string.
     * @returns The JSON string.
     */
    public static exportJson(): string {
        return JSON.stringify(this.export())
    }
    /**
     * Export the canvas and the tickers to an object.
     * @returns The object.
     */
    public static export(): ExportedCanvas {
        let currentElements: { [alias: string]: ICanvasBaseMemory } = {}
        for (let alias in GameWindowManager._children) {
            currentElements[alias] = exportCanvasElement(GameWindowManager._children[alias])
        }
        return {
            currentTickers: createExportableElement(GameWindowManager.currentTickersWithoutCreatedBySteps),
            currentTickersSteps: createExportableElement(GameWindowManager._currentTickersSteps),
            currentElements: createExportableElement(currentElements),
            childrenTagsOrder: createExportableElement(GameWindowManager.childrenTagsOrder),
        }
    }
    /**
     * Import the canvas and the tickers from a JSON string.
     * @param dataString The JSON string.
     */
    public static importJson(dataString: string) {
        GameWindowManager.import(JSON.parse(dataString))
    }
    /**
     * Import the canvas and the tickers from an object.
     * @param data The object.
     */
    public static import(data: object) {
        GameWindowManager.clear()
        try {
            if (data.hasOwnProperty("childrenTagsOrder") && data.hasOwnProperty("currentElements")) {
                let currentElements = (data as ExportedCanvas)["currentElements"]
                let childrenTagsOrder = (data as ExportedCanvas)["childrenTagsOrder"]
                childrenTagsOrder.forEach((alias) => {
                    if (currentElements[alias]) {
                        let element = importCanvasElement(currentElements[alias])
                        GameWindowManager.add(alias, element)
                        GameWindowManager.childrenTagsOrder.push(alias)
                    }
                })
            }
            else {
                console.error("[Pixi'VN] The data does not have the properties childrenTagsOrder and currentElements")
                return
            }
            if (data.hasOwnProperty("currentTickers")) {
                let currentTickers = (data as ExportedCanvas)["currentTickers"]
                for (let id in currentTickers) {
                    let t = currentTickers[id]
                    let aliases: string[] = t.canvasElementTags
                    let ticker = geTickerInstanceById(t.id, t.args, t.duration, t.priority)
                    if (ticker) {
                        GameWindowManager.addTicker(aliases, ticker)
                    }
                    else {
                        console.error(`[Pixi'VN] Ticker ${t.id} not found`)
                    }
                }
            }
            if (data.hasOwnProperty("currentTickersSteps")) {
                let currentTickersSteps = (data as ExportedCanvas)["currentTickersSteps"]
                GameWindowManager.restoneTickersSteps(currentTickersSteps)
            }
        }
        catch (e) {
            console.error("[Pixi'VN] Error importing data", e)
        }
    }
}
