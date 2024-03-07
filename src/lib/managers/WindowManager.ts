import { Application, ApplicationOptions, Container, Ticker, UPDATE_PRIORITY } from "pixi.js";
import { CanvasEvent } from "../classes/CanvasEvent";
import { CanvasBase } from "../classes/canvas/CanvasBase";
import { TickerArgsType, TickerBase } from "../classes/ticker/TickerBase";
import { IClassWithArgsHistory } from "../interface/IClassWithArgsHistory";
import { ITicker } from "../interface/ITicker";
import { ITickersStep, ITickersSteps } from "../interface/ITickersSteps";
import { ICanvasBaseMemory } from "../interface/canvas/ICanvasBaseMemory";
import { ExportedCanvas } from "../interface/export/ExportedCanvas";
import { CanvasEventNamesType } from "../types/CanvasEventNamesType";
import { EventTagType } from "../types/EventTagType";
import { PauseType, PauseValueType } from "../types/PauseType";
import { Repeat, RepeatType } from "../types/RepeatType";
import { SupportedCanvasElement } from "../types/SupportedCanvasElement";
import { TickerTagType } from "../types/TickerTagType";

/**
 * This class is responsible for managing the canvas, the tickers, the events, and the window size and the children of the window.
 * This implementation was followed: https://www.pixijselementals.com/#letterbox-scale
 */
export class GameWindowManager {
    private constructor() { }

    /**
     * The PIXI Application instance.
     */
    private static app: Application = new Application()
    /**
     * This is the div that have same size of the canvas.
     * This is useful to put interface elements.
     * You can use React or other framework to put elements in this div.
     */
    static htmlLayout: HTMLElement
    static width: number
    static height: number
    static get screen() {
        return GameWindowManager.app.screen
    }

    /**
     * Initialize the PIXI Application and the interface div.
     * This method should be called before any other method.
     * @param width The width of the canvas
     * @param height The height of the canvas
     * @param options The options of PIXI Application
     */
    public static initialize(width: number, height: number, options?: Partial<ApplicationOptions>): void {
        GameWindowManager.width = width
        GameWindowManager.height = height
        GameWindowManager.app.init(options)

        // Manager.app.ticker.add(Manager.update)

        // listen for the browser telling us that the screen size changed
        window.addEventListener("resize", GameWindowManager.resize)

        // call it manually once so we are sure we are the correct size after starting
        GameWindowManager.resize()
    }

    /**
     * Add the canvas into a html element.
     * @param element it is the html element where I will put the canvas. Example: document.body
     */
    public static addCanvasIntoElement(element: HTMLElement) {
        element.appendChild(GameWindowManager.app.view as HTMLCanvasElement)
    }
    /**
     * Initialize the interface div and add it into a html element.
     * @param element it is the html element where I will put the interface div. Example: document.getElementById('root')
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
        return Math.min(screenWidth / GameWindowManager.width, screenHeight / GameWindowManager.height)
    }
    /**
     * This method returns the width of the screen enlarged by the scale.
     */
    public static get enlargedWidth() {
        return Math.floor(GameWindowManager.screenScale * GameWindowManager.width)
    }
    /**
     * This method returns the height of the screen enlarged by the scale.
     */
    public static get enlargedHeight() {
        return Math.floor(GameWindowManager.screenScale * GameWindowManager.height)
    }
    /**
     * This method returns the horizontal margin of the screen.
     */
    public static get horizontalMargin() {
        let screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        return (screenWidth - GameWindowManager.enlargedWidth) / 2
    }
    /**
     * This method returns the vertical margin of the screen.
     */
    public static get verticalMargin() {
        let screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        return (screenHeight - GameWindowManager.enlargedHeight) / 2
    }
    /**
     * This method is called when the screen is resized.
     */
    private static resize(): void {
        // now we use css trickery to set the sizes and margins
        if (!GameWindowManager.app.canvas?.style) {
            console.error("Manager.app.canvas.style is undefined")
        }
        else {
            let style = GameWindowManager.app.canvas.style;
            style.width = `${GameWindowManager.enlargedWidth}px`;
            style.height = `${GameWindowManager.enlargedHeight}px`;
            (style as any).marginLeft = `${GameWindowManager.horizontalMargin}px`;
            (style as any).marginRight = `${GameWindowManager.horizontalMargin}px`;
            (style as any).marginTop = `${GameWindowManager.verticalMargin}px`;
            (style as any).marginBottom = `${GameWindowManager.verticalMargin}px`;
        }

        if (GameWindowManager.htmlLayout) {
            GameWindowManager.htmlLayout.style.width = `${GameWindowManager.enlargedWidth}px`
            GameWindowManager.htmlLayout.style.height = `${GameWindowManager.enlargedHeight}px`
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
    private static _children: { [tag: string]: SupportedCanvasElement } = {}
    /**
     * Add a canvas element to the canvas.
     * If there is a canvas element with the same tag, it will be removed.
     * @param tag The tag of the canvas element.
     * @param canvasElement The canvas elements to be added.
     */
    public static addCanvasElement(tag: string, canvasElement: SupportedCanvasElement) {
        if (GameWindowManager._children[tag]) {
            GameWindowManager.removeCanvasElement(tag)
        }
        GameWindowManager.app.stage.addChild(canvasElement)
        GameWindowManager._children[tag] = canvasElement
    }
    /**
     * Remove a canvas element from the canvas.
     * And remove all tickers that are not connected to any canvas element.
     * @param tag The tag of the canvas element to be removed.
     * @returns 
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
    }
    /**
     * Get a canvas element by the tag.
     * @param tag The tag of the canvas element.
     * @returns The canvas element.
     */
    public static getCanvasElement(tag: string): SupportedCanvasElement | undefined {
        return GameWindowManager._children[tag] as SupportedCanvasElement | undefined
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
        GameWindowManager.removeTickers()
    }
    /**
     * Add a temporary canvas element to the canvas.
     * @param canvasElement The canvas elements to be added.
     */
    public static addCanvasElementTemporary(canvasElement: SupportedCanvasElement | Container) {
        if (canvasElement instanceof CanvasBase) {
            canvasElement = canvasElement
        }
        GameWindowManager.app.stage.addChild(canvasElement)
    }
    /**
     * Remove a temporary canvas element from the canvas.
     * @param canvasElement The canvas elements to be removed.
     */
    public static removeCanvasElementTemporary(canvasElement: Container) {
        if (canvasElement instanceof CanvasBase) {
            GameWindowManager.app.stage.removeChild(canvasElement)
            return
        }
        GameWindowManager.app.stage.removeChild(canvasElement)
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
     * A dictionary that contains all tickers registered and avvailable to be used.
     */
    static registeredTicker: { [name: TickerTagType]: typeof TickerBase } = {}
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
     */
    static addTicker<TArgs extends TickerArgsType>(canvasElementTag: string | string[], ticker: TickerBase<TArgs>) {
        let tickerName: TickerTagType = ticker.constructor.name
        if (typeof canvasElementTag === "string") {
            canvasElementTag = [canvasElementTag]
        }
        let t = GameWindowManager.geTickerInstance<TArgs>(tickerName, ticker.args, ticker.duration, ticker.priority)
        if (!t) {
            console.error(`Ticker ${tickerName} not found`)
            return
        }
        GameWindowManager.removeAssociationBetweenTickerCanvasElement(canvasElementTag, ticker)
        let tickerHistory: IClassWithArgsHistory<TArgs> = {
            fn: () => { },
            className: tickerName,
            args: ticker.args,
            canvasElementTags: canvasElementTag,
            priority: ticker.priority
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
     */
    static addTickersSteps<TArgs extends TickerArgsType>(tag: string, steps: (ITicker<TArgs> | RepeatType | PauseType)[]) {
        if (steps.length == 0) {
            console.error("Steps is empty")
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
                    console.warn("Duration is not defined, so it will be set to 1000")
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
                console.error("TikersSteps has a RepeatType in the first step")
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
        let ticker = GameWindowManager.geTickerInstance<TArgs>((step as ITickersStep<TArgs>).ticker, (step as ITickersStep<TArgs>).args, step.duration, (step as ITickersStep<TArgs>).priority)
        if (!ticker) {
            console.error(`Ticker ${(step as ITickersStep<TArgs>).ticker} not found`)
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
     */
    public static removeAssociationBetweenTickerCanvasElement(tag: string | string[], ticker: typeof TickerBase<any> | TickerBase<any>) {
        let tickerName: TickerTagType
        if (ticker instanceof TickerBase) {
            tickerName = ticker.constructor.name
        }
        else {
            tickerName = ticker.name
        }
        if (typeof tag === "string") {
            tag = [tag]
        }
        GameWindowManager._currentTickers.map((t) => {
            if (t.className === tickerName) {
                t.canvasElementTags = t.canvasElementTags.filter((e) => !tag.includes(e))
            }
            return t
        })
        for (let timeout in GameWindowManager.currentTickersTimeouts) {
            let t = GameWindowManager.currentTickersTimeouts[timeout].tags.filter((e) => !tag.includes(e))
            if (t.length == 0) {
                GameWindowManager.removeTickerTimeoutInfo(parseInt(timeout))
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
    private static removeTickerTimeoutInfo(timeout: number) {
        if (GameWindowManager.currentTickersTimeouts[timeout]) {
            delete GameWindowManager.currentTickersTimeouts[timeout]
        }
    }
    /**
     * Get a ticker instance by the class name.
     * @param tickerName The name of the class.
     * @returns The ticker instance.
     */
    private static geTickerInstance<TArgs extends TickerArgsType>(tickerName: TickerTagType, args: TArgs, duration?: number, priority?: UPDATE_PRIORITY): TickerBase<TArgs> | undefined {
        try {
            let ticker = GameWindowManager.registeredTicker[tickerName]
            if (!ticker) {
                console.error(`Ticker ${tickerName} not found`)
                return
            }
            return new ticker(args, duration, priority)
        }
        catch (e) {
            console.error(e)
            return
        }
    }
    /**
     * Remove all tickers from the canvas.
     */
    public static removeTickers() {
        GameWindowManager._currentTickersSteps = {}
        GameWindowManager._currentTickers.map((t) => {
            GameWindowManager.app.ticker.remove(t.fn)
        })
        GameWindowManager._currentTickers = []
    }

    /**
     * Canvas Event Register
     */
    static registeredEvent: { [name: EventTagType]: typeof CanvasEvent<CanvasEventNamesType> } = {}
    /**
     * Get an event instance by the class name.
     * @param labelName The name of the class.
     * @returns The event instance.
     */
    public static getEventInstanceByClassName<T = CanvasEvent<SupportedCanvasElement>>(labelName: EventTagType): T | undefined {
        try {
            let event = GameWindowManager.registeredEvent[labelName]
            if (!event) {
                console.error(`Event ${labelName} not found`)
                return
            }
            return new event() as T
        }
        catch (e) {
            console.error(e)
            return
        }
    }

    /**
     * Clear the canvas and the tickers.
     */
    static clear() {
        GameWindowManager.removeCanvasElements()
    }

    public static exportJson(): string {
        return JSON.stringify(this.export())
    }
    public static export(): ExportedCanvas {
        let currentElements: ICanvasBaseMemory[] = []
        for (let tag in GameWindowManager._children) {
            currentElements.push(GameWindowManager._children[tag].memory)
        }
        return {
            currentTickers: GameWindowManager._currentTickers,
            currentElements: currentElements
        }
    }
    public static importJson(dataString: string) {
        GameWindowManager.import(JSON.parse(dataString))
    }
    public static import(data: object) {
        GameWindowManager.clear()
        try {
            if (data.hasOwnProperty("currentTickers")) {
                GameWindowManager._currentTickers = (data as ExportedCanvas)["currentTickers"]
            }
            else {
                console.log("No currentTickers data found")
            }
        }
        catch (e) {
            console.error("Error importing data", e)
        }
    }
}
