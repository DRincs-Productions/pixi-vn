import { Application, ApplicationOptions, Container, Ticker } from "pixi.js";
import CanvasBase from "../classes/canvas/CanvasBase";
import TickerBase, { TickerArgsType } from "../classes/ticker/TickerBase";
import { geTickerInstanceByClassName } from "../decorators/TickerDecorator";
import { exportCanvasElement, importCanvasElement } from "../functions/CanvasUtility";
import { asciiArtLog } from "../functions/EasterEgg";
import { createExportableElement } from "../functions/ExportUtility";
import { ITicker, ITickersSteps } from "../interface";
import { IClassWithArgsHistory } from "../interface/IClassWithArgsHistory";
import { ITickersStep } from "../interface/ITickersSteps";
import { ICanvasBaseMemory } from "../interface/canvas";
import { ExportedCanvas } from "../interface/export";
import { PauseType, PauseValueType } from "../types/PauseType";
import { Repeat, RepeatType } from "../types/RepeatType";
import { TickerIdType } from "../types/TickerIdType";

/**
 * This class is responsible for managing the canvas, the tickers, the events, and the window size and the children of the window.
 */
export default class GameWindowManager {
    private constructor() { }

    private static _app: Application | undefined = undefined
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
     * await GameWindowManager.initialize(body, 1920, 1080, {
     *     backgroundColor: "#303030"
     * })
     * ```
     */
    public static async initialize(element: HTMLElement, width: number, height: number, options?: Partial<ApplicationOptions>): Promise<void> {
        GameWindowManager.canvasWidth = width
        GameWindowManager.canvasHeight = height
        GameWindowManager._app = new Application()
        return await GameWindowManager.app.init({
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            width: width,
            height: height,
            ...options
        }).then(() => {
            GameWindowManager._isInitialized = true
            // Manager.app.ticker.add(Manager.update)
            this.addCanvasIntoElement(element)
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
    private static addCanvasIntoElement(element: HTMLElement) {
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
     * ```typescript
     * const root = document.getElementById('root')
     * if (!root) {
     *     throw new Error('root element not found')
     * }
     * GameWindowManager.initializeHTMLLayout(root)
     * const reactRoot = createRoot(GameWindowManager.htmlLayout)
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
    private static _children: { [tag: string]: CanvasBase<any> } = {}
    /**
     * The order of the children tags.
     */
    private static childrenTagsOrder: string[] = []
    /**
     * Add a canvas element to the canvas.
     * If there is a canvas element with the same tag, it will be removed.
     * @param tag The tag of the canvas element.
     * @param canvasElement The canvas elements to be added.
     * @example
     * ```typescript
     * const texture = await Assets.load('https://pixijs.com/assets/bunny.png');
     * const sprite = CanvasSprite.from(texture);
     * GameWindowManager.addCanvasElement("bunny", sprite);
     * ```
     */
    public static addCanvasElement(tag: string, canvasElement: CanvasBase<any>) {
        if (GameWindowManager._children[tag]) {
            GameWindowManager.removeCanvasElement(tag)
        }
        GameWindowManager.app.stage.addChild(canvasElement)
        GameWindowManager._children[tag] = canvasElement
        GameWindowManager.childrenTagsOrder.push(tag)
    }
    /**
     * Remove a canvas element from the canvas.
     * And remove all tickers that are not connected to any canvas element.
     * @param tag The tag of the canvas element to be removed.
     * @returns 
     * @example
     * ```typescript
     * GameWindowManager.removeCanvasElement("bunny");
     * ```
     */
    public static removeCanvasElement(tag: string | string[]) {
        if (typeof tag === "string") {
            tag = [tag]
        }
        tag.forEach((t) => {
            if (GameWindowManager._children[t]) {
                GameWindowManager.app.stage.removeChild(GameWindowManager._children[t])
                delete GameWindowManager._children[t]
            }
        })
        GameWindowManager.removeTickersWithoutAssociatedCanvasElement()
        GameWindowManager.childrenTagsOrder = GameWindowManager.childrenTagsOrder.filter((t) => !tag.includes(t))
    }
    /**
     * Get a canvas element by the tag.
     * @param tag The tag of the canvas element.
     * @returns The canvas element.
     * @example
     * ```typescript
     * const sprite = GameWindowManager.getCanvasElement<CanvasSprite>("bunny");
     * ```
     */
    public static getCanvasElement<T extends CanvasBase<any>>(tag: string): T | undefined {
        return GameWindowManager._children[tag] as T | undefined
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
    public static removeCanvasElements() {
        GameWindowManager.app.stage.removeChildren()
        GameWindowManager._children = {}
        GameWindowManager.childrenTagsOrder = []
        GameWindowManager.removeTickers()
    }
    /**
     * Edit the tag of a canvas element.
     * @param oldTag The old tag of the canvas element.
     * @param newTag The new tag of the canvas element.
     */
    public static editTagCanvasElement(oldTag: string, newTag: string) {
        if (GameWindowManager._children[oldTag]) {
            GameWindowManager._children[newTag] = GameWindowManager._children[oldTag]
            delete GameWindowManager._children[oldTag]
        }
    }

    /** Edit Tickers Methods */

    /**
     * Currently tickers that are running.
     */
    public static get currentTickers() {
        return GameWindowManager._currentTickers
    }
    private static _currentTickers: IClassWithArgsHistory<any>[] = []
    /**
     * The steps of the tickers
     */
    public static get currentTickersSteps() {
        return GameWindowManager._currentTickersSteps
    }
    private static _currentTickersSteps: { [tag: string]: ITickersSteps } = {}
    static currentTickersTimeouts: { [timeout: string]: { tags: string[], ticker: string } } = {}
    /**
     * Run a ticker.
     * @param canvasEslementTag The tag of the canvas element that will use the ticker.
     * @param ticker The ticker class to be run.
     * @param args The arguments to be used in the ticker.
     * @param duration The time to be used in the ticker. This number is in milliseconds. If it is undefined, the ticker will run forever.
     * @param priority The priority to be used in the ticker.
     * @returns 
     * @example
     * ```typescript
     * GameWindowManager.addTicker("alien", new TickerRotate({ speed: 0.2 }))
     * ```
     */
    static addTicker<TArgs extends TickerArgsType>(canvasElementTag: string | string[], ticker: TickerBase<TArgs>) {
        let tickerName: TickerIdType = ticker.constructor.name
        if (typeof canvasElementTag === "string") {
            canvasElementTag = [canvasElementTag]
        }
        let t = geTickerInstanceByClassName<TArgs>(tickerName, ticker.args, ticker.duration, ticker.priority)
        if (!t) {
            console.error(`[Pixi'VN] Ticker ${tickerName} not found`)
            return
        }
        GameWindowManager.removeAssociationBetweenTickerCanvasElement(canvasElementTag, ticker)
        let tickerHistory: IClassWithArgsHistory<TArgs> = {
            fn: () => { },
            className: tickerName,
            args: ticker.args,
            canvasElementTags: canvasElementTag,
            priority: ticker.priority,
            duration: ticker.duration,
        }
        GameWindowManager.pushTicker(tickerHistory, t)
        GameWindowManager.removeTickersWithoutAssociatedCanvasElement()
        if (ticker.duration) {
            let timeout = setTimeout(() => {
                GameWindowManager.removeTickerTimeoutInfo(timeout)
                GameWindowManager.nextTickerStep(canvasElementTag)
            }, ticker.duration);
            GameWindowManager.addTickerTimeoutInfo(canvasElementTag, tickerName, timeout.toString())
        }
    }
    private static pushTicker<TArgs extends TickerArgsType>(tickerData: IClassWithArgsHistory<TArgs>, ticker: TickerBase<TArgs>) {
        GameWindowManager.removeAssociationBetweenTickerCanvasElement(tickerData.canvasElementTags, tickerData)
        GameWindowManager._currentTickers.push(tickerData)
        tickerData.fn = (t: Ticker) => {
            ticker?.fn(t, tickerData.args, tickerData.canvasElementTags)
        }
        GameWindowManager.app.ticker.add(tickerData.fn, undefined, tickerData.priority)
    }
    /**
     * Run a sequence of tickers.
     * @param tag The tag of canvas element that will use the tickers.
     * @param steps The steps of the tickers.
     * @returns
     * @example
     * ```typescript
     * GameWindowManager.addTickersSteps("alien", [
     *     new TickerRotate({ speed: 0.1, clockwise: true }, 2000),
     *     Pause(500),
     *     new TickerRotate({ speed: 0.2, clockwise: false }, 2000),
     *     Repeat,
     * ])
     * ```
     */
    static addTickersSteps<TArgs extends TickerArgsType>(tag: string, steps: (ITicker<TArgs> | RepeatType | PauseType)[]) {
        if (steps.length == 0) {
            console.warn("[Pixi'VN] The steps of the tickers is empty")
            return
        }
        let alredyExists = GameWindowManager._currentTickersSteps[tag] !== undefined
        GameWindowManager._currentTickersSteps[tag] = {
            currentStepNumber: 0,
            steps: steps.map((s) => {
                if (s === Repeat) {
                    return s
                }
                if (!s.duration) {
                    console.warn("[Pixi'VN] Duration is not defined, so it will be set to 1000")
                    s.duration = 1000
                }
                if (s.hasOwnProperty("type") && (s as PauseType).type === PauseValueType) {
                    return s as PauseType
                }
                let tickerName = s.constructor.name
                return {
                    ticker: tickerName,
                    args: (s as ITicker<TArgs>).args,
                    duration: s.duration,
                }
            })
        }
        if (!alredyExists) {
            GameWindowManager.runTickersSteps(tag)
        }
    }
    private static runTickersSteps<TArgs extends TickerArgsType>(tag: string) {
        let step = GameWindowManager._currentTickersSteps[tag].steps[GameWindowManager._currentTickersSteps[tag].currentStepNumber]
        if (step === Repeat) {
            step = GameWindowManager._currentTickersSteps[tag].steps[0]
            GameWindowManager._currentTickersSteps[tag].currentStepNumber = 0
            if (step === Repeat) {
                console.error("[Pixi'VN] TikersSteps has a RepeatType in the first step")
                return
            }
        }
        if (step.hasOwnProperty("type") && (step as PauseType).type === PauseValueType) {
            let timeout = setTimeout(() => {
                GameWindowManager.removeTickerTimeoutInfo(timeout)
                GameWindowManager.nextTickerStep(tag)
            }, step.duration);
            GameWindowManager.addTickerTimeoutInfo(tag, "steps", timeout.toString())
            return
        }
        let ticker = geTickerInstanceByClassName<TArgs>((step as ITickersStep<TArgs>).ticker, (step as ITickersStep<TArgs>).args, step.duration, (step as ITickersStep<TArgs>).priority)
        if (!ticker) {
            console.error(`[Pixi'VN] Ticker ${(step as ITickersStep<TArgs>).ticker} not found`)
            return
        }
        GameWindowManager.addTicker(tag, ticker)
    }
    private static nextTickerStep(tag: string | string[]) {
        if (typeof tag === "string") {
            tag = [tag]
        }
        tag.forEach((tag) => {
            if (GameWindowManager._currentTickersSteps[tag]) {
                let steps = GameWindowManager._currentTickersSteps[tag]
                if (steps.currentStepNumber + 1 < steps.steps.length) {
                    steps.currentStepNumber++
                    GameWindowManager._currentTickersSteps[tag] = steps
                    GameWindowManager.runTickersSteps(tag)
                }
                else {
                    delete GameWindowManager._currentTickersSteps[tag]
                }
            }
        })
    }
    /**
     * Remove a connection between a canvas element and a ticker.
     * And remove the ticker if there is no canvas element connected to it.
     * @param tag The tag of the canvas element that will use the ticker.
     * @param ticker The ticker class to be removed.
     * @example
     * ```typescript
     * GameWindowManager.removeAssociationBetweenTickerCanvasElement("alien", TickerRotate)
     * ```
     */
    public static removeAssociationBetweenTickerCanvasElement(tag: string | string[], ticker: typeof TickerBase<any> | TickerBase<any>) {
        let tickerName: TickerIdType
        if (ticker instanceof TickerBase) {
            tickerName = ticker.constructor.name
        }
        else {
            tickerName = ticker.name
        }
        if (typeof tag === "string") {
            tag = [tag]
        }
        GameWindowManager._currentTickers = GameWindowManager._currentTickers.map((t) => {
            if (t.className === tickerName) {
                t.canvasElementTags = t.canvasElementTags.filter((e) => !tag.includes(e))
            }
            return t
        })
        for (let timeout in GameWindowManager.currentTickersTimeouts) {
            let t = GameWindowManager.currentTickersTimeouts[timeout].tags.filter((e) => !tag.includes(e))
            if (t.length == 0) {
                GameWindowManager.removeTickerTimeoutInfo(timeout)
            }
            else {
                GameWindowManager.currentTickersTimeouts[timeout].tags = t
            }
        }
        GameWindowManager.removeTickersWithoutAssociatedCanvasElement()
    }
    /**
     * Remove all tickers that are not connected to any existing canvas element.
     */
    private static removeTickersWithoutAssociatedCanvasElement() {
        let currentTickers = GameWindowManager._currentTickers
            .map((t) => {
                t.canvasElementTags = t.canvasElementTags.filter((e) => GameWindowManager._children[e])
                return t
            })
        currentTickers.filter((t) => t.canvasElementTags.length === 0).forEach((t) => {
            GameWindowManager.app.ticker.remove(t.fn)
        })
        currentTickers = currentTickers.filter((t) => t.canvasElementTags.length > 0)
        GameWindowManager._currentTickers = currentTickers
        for (let tag in GameWindowManager._currentTickersSteps) {
            if (GameWindowManager._children[tag] === undefined) {
                delete GameWindowManager._currentTickersSteps[tag]
            }
        }
    }
    private static addTickerTimeoutInfo(tags: string | string[], ticker: string, timeout: string) {
        if (typeof tags === "string") {
            tags = [tags]
        }
        GameWindowManager.currentTickersTimeouts[timeout] = {
            tags: tags,
            ticker: ticker,
        }
    }
    private static removeTickerTimeoutInfo(timeout: NodeJS.Timeout | string) {
        if (typeof timeout !== "string") {
            timeout = timeout.toString()
        }
        if (GameWindowManager.currentTickersTimeouts[timeout]) {
            delete GameWindowManager.currentTickersTimeouts[timeout]
        }
    }
    /**
     * Remove all tickers from the canvas.
     */
    public static removeTickers() {
        GameWindowManager._currentTickersSteps = {}
        GameWindowManager._currentTickers.forEach((t) => {
            GameWindowManager.app.ticker.remove(t.fn)
        })
        GameWindowManager._currentTickers = []
        for (let timeout in GameWindowManager.currentTickersTimeouts) {
            GameWindowManager.removeTickerTimeoutInfo(timeout)
        }
    }

    /**
     * Clear the canvas and the tickers.
     */
    static clear() {
        GameWindowManager.removeCanvasElements()
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
        let currentElements: { [tag: string]: ICanvasBaseMemory } = {}
        for (let tag in GameWindowManager._children) {
            currentElements[tag] = exportCanvasElement(GameWindowManager._children[tag])
        }
        return {
            currentTickers: createExportableElement(GameWindowManager._currentTickers),
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
                childrenTagsOrder.forEach((tag) => {
                    if (currentElements[tag]) {
                        let element = importCanvasElement(currentElements[tag])
                        GameWindowManager.addCanvasElement(tag, element)
                        GameWindowManager.childrenTagsOrder.push(tag)
                    }
                })
            }
            else {
                console.error("[Pixi'VN] The data does not have the properties childrenTagsOrder and currentElements")
                return
            }
            if (data.hasOwnProperty("currentTickers")) {
                let currentTickers = (data as ExportedCanvas)["currentTickers"]
                currentTickers.forEach((t) => {
                    let tags: string[] = t.canvasElementTags
                    let ticker = geTickerInstanceByClassName(t.className, t.args, t.duration, t.priority)
                    if (ticker) {
                        GameWindowManager.addTicker(tags, ticker)
                    }
                    else {
                        console.error(`[Pixi'VN] Ticker ${t.className} not found`)
                    }
                })
            }
        }
        catch (e) {
            console.error("[Pixi'VN] Error importing data", e)
        }
    }
}
