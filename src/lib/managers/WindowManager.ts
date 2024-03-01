import { Application, DisplayObject, IApplicationOptions, UPDATE_PRIORITY } from "pixi.js";
import { CanvasEvent } from "../classes/CanvasEvent";
import { TickerArgsType, TickerClass } from "../classes/TickerClass";
import { CanvasBase } from "../classes/canvas/CanvasBase";
import { IClassWithArgsHistory } from "../interface/IClassWithArgsHistory";
import { ITicker } from "../interface/ITicker";
import { ITickersStep, ITickersSteps } from "../interface/ITickersSteps";
import { ICanvasBaseMemory } from "../interface/canvas/ICanvasBaseMemory";
import { ExportedCanvas } from "../interface/export/ExportedCanvas";
import { EventTagType } from "../types/EventTagType";
import { PauseType, PauseValueType } from "../types/PauseType";
import { Repeat, RepeatType } from "../types/RepeatType";
import { TickerTagType } from "../types/TickerTagType";

/**
 * This class is responsible for managing the window size and the children of the window.
 * This implementation was followed: https://www.pixijselementals.com/#letterbox-scale
 */
export class GameWindowManager {
    private constructor() { }

    /**
     * The PIXI Application instance.
     */
    private static app: Application
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
    public static initialize(width: number, height: number, options?: Partial<IApplicationOptions>): void {
        GameWindowManager.width = width
        GameWindowManager.height = height
        GameWindowManager.app = new Application({
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            width: width,
            height: height,
            ...options
        });

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
        if (!GameWindowManager.app?.view?.style) {
            console.error("Manager.app.view.style is undefined")
        }
        else {
            let style = GameWindowManager.app.view.style;
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

    /* Edit Children Methods */

    /**
     * This is a dictionary that contains all children of Canvas, currently.
     */
    private static children: { [tag: string]: CanvasBase<any, any> } = {}
    /**
     * Add a child to the canvas.
     * If there is a child with the same tag, it will be removed.
     * @param tag The tag of the child.
     * @param child The child to be added.
     */
    public static addChild<T1 extends DisplayObject, T2 extends ICanvasBaseMemory>(tag: string, child: CanvasBase<T1, T2>) {
        if (GameWindowManager.children[tag]) {
            GameWindowManager.removeChild(tag)
        }
        GameWindowManager.app.stage.addChild(child.pixiElement)
        GameWindowManager.children[tag] = child
    }
    /**
     * Remove a child from the canvas.
     * And remove all tickers that are not connected to any child.
     * @param tag The tag of the child to be removed.
     * @returns 
     */
    public static removeChild(tag: string) {
        if (!GameWindowManager.children[tag]) {
            console.error("Child with tag not found")
            return
        }
        GameWindowManager.app.stage.removeChild(GameWindowManager.children[tag].pixiElement)
        delete GameWindowManager.children[tag]
        GameWindowManager.removeTickersWithoutConnectedChild()
    }
    /**
     * Get a child from the canvas.
     * @param tag The tag of the child to be returned.
     * @returns The child with the tag.
     */
    public static getChild<T extends CanvasBase<any, any>>(tag: string): T | undefined {
        return GameWindowManager.children[tag] as T | undefined
    }
    /**
     * Remove all children from the canvas.
     * And remove all tickers that are not connected to any child.
     */
    public static removeChildren() {
        GameWindowManager.app.stage.removeChildren()
        GameWindowManager.children = {}
        GameWindowManager.removeTickersWithoutConnectedChild()
    }
    /**
     * Add a temporary child to the canvas.
     * @param child The child to be added.
     */
    public static addChildTemporary<T1 extends DisplayObject, T2 extends ICanvasBaseMemory>(child: CanvasBase<T1, T2> | DisplayObject) {
        if (child instanceof CanvasBase) {
            child = child.pixiElement
        }
        GameWindowManager.app.stage.addChild(child)
    }
    /**
     * Remove a temporary child from the canvas.
     * @param child The child to be removed.
     */
    public static removeChildTemporary(child: DisplayObject) {
        if (child instanceof CanvasBase) {
            GameWindowManager.app.stage.removeChild(child.pixiElement)
            return
        }
        GameWindowManager.app.stage.removeChild(child)
    }

    /** Edit Tickers Methods */

    /**
     * A dictionary that contains all tickers registered and avvailable to be used.
     */
    static registeredTicker: { [name: TickerTagType]: typeof TickerClass } = {}
    /**
     * Currently tickers that are running.
     */
    static currentTickers: IClassWithArgsHistory<any>[] = []
    /**
     * The steps of the tickers
     */
    static currentTickersSteps: { [tag: string]: ITickersSteps } = {}
    /**
     * Run a ticker.
     * @param childTags The tag of the child that will use the ticker.
     * @param ticker The ticker class to be run.
     * @param args The arguments to be used in the ticker.
     * @param duration The time to be used in the ticker. This number is in milliseconds. If it is undefined, the ticker will run forever.
     * @param priority The priority to be used in the ticker.
     * @returns 
     */
    static addTicker<TArgs extends TickerArgsType>(childTags: string | string[], ticker: TickerClass<TArgs>) {
        let tickerName: TickerTagType = ticker.constructor.name
        if (typeof childTags === "string") {
            childTags = [childTags]
        }
        let t = GameWindowManager.geTickerInstance<TArgs>(tickerName, ticker.args, ticker.duration, ticker.priority)
        if (!t) {
            console.error(`Ticker ${tickerName} not found`)
            return
        }
        GameWindowManager.removeTickerConnectedToChild(childTags, ticker)
        let tickerHistory: IClassWithArgsHistory<TArgs> = {
            fn: () => { },
            className: tickerName,
            args: ticker.args,
            childTags: childTags,
            priority: ticker.priority
        }
        GameWindowManager.pushOrReplaceTicker(tickerHistory, t)
        GameWindowManager.removeTickersWithoutConnectedChild()
        if (ticker.duration) {
            setTimeout(() => {
                GameWindowManager.removeTickerConnectedToChild(childTags, ticker)
                GameWindowManager.nextTickerStep(childTags)
            }, ticker.duration);
        }
    }
    private static pushOrReplaceTicker<TArgs extends TickerArgsType>(ticker: IClassWithArgsHistory<TArgs>, t: TickerClass<TArgs>) {
        let index = GameWindowManager.currentTickers.findIndex((t) =>
            t.className === ticker.className &&
            t.priority === ticker.priority &&
            JSON.stringify(t.args) === JSON.stringify(ticker.args)
        )
        if (index === -1) {
            GameWindowManager.currentTickers.push(ticker)
        }
        else {
            GameWindowManager.app.ticker.remove(GameWindowManager.currentTickers[index].fn)
            ticker.childTags = GameWindowManager.currentTickers[index].childTags.filter((e) => !ticker.childTags.includes(e)).concat(ticker.childTags)
            GameWindowManager.currentTickers[index] = ticker
        }
        ticker.fn = (dt: number) => {
            t?.fn(dt, ticker.args, ticker.childTags)
        }
        GameWindowManager.app.ticker.add(ticker.fn, undefined, ticker.priority)
    }
    public static addTickersSteps<TArgs extends TickerArgsType>(tag: string, steps: (ITicker<TArgs> | RepeatType | PauseType)[]) {
        if (steps.length == 0) {
            console.error("Steps is empty")
            return
        }
        GameWindowManager.currentTickersSteps[tag] = {
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
        GameWindowManager.runTickersSteps(tag, GameWindowManager.currentTickersSteps[tag].steps[0])
    }
    private static runTickersSteps<TArgs extends TickerArgsType>(tag: string, step: ITickersStep<TArgs> | RepeatType | PauseType) {
        if (step === Repeat) {
            step = GameWindowManager.currentTickersSteps[tag].steps[0]
            GameWindowManager.currentTickersSteps[tag].currentStepNumber = 0
            if (step === Repeat) {
                console.error("TikersSteps has a RepeatType in the first step")
                return
            }
        }
        if (step.hasOwnProperty("type") && (step as PauseType).type === PauseValueType) {
            setTimeout(() => {
                GameWindowManager.nextTickerStep(tag)
            }, step.duration);
            return
        }
        let ticker = GameWindowManager.geTickerInstance<TArgs>((step as ITickersStep<TArgs>).ticker, (step as ITickersStep<TArgs>).args, step.duration, (step as ITickersStep<TArgs>).priority)
        if (!ticker) {
            console.error(`Ticker ${(step as ITickersStep<TArgs>).ticker} not found`)
            return
        }
        GameWindowManager.addTicker(tag, ticker)
    }
    private static nextTickerStep(childTag: string | string[]) {
        if (typeof childTag === "string") {
            childTag = [childTag]
        }
        childTag.forEach((tag) => {
            if (GameWindowManager.currentTickersSteps[tag]) {
                let steps = GameWindowManager.currentTickersSteps[tag]
                let currentStepNumber = steps.currentStepNumber
                if (currentStepNumber + 1 < steps.steps.length) {
                    steps.currentStepNumber++
                    GameWindowManager.currentTickersSteps[tag] = steps
                    GameWindowManager.runTickersSteps(tag, steps.steps[steps.currentStepNumber])
                }
                else {
                    delete GameWindowManager.currentTickersSteps[tag]
                }
            }
        })
    }
    /**
     * Remove a connection between a child and a ticker.
     * And remove the ticker if there is no child connected to it.
     * @param childTag The tag of the child that will use the ticker.
     * @param ticker The ticker class to be removed.
     */
    public static removeTickerConnectedToChild(childTag: string | string[], ticker: typeof TickerClass<any> | TickerClass<any>) {
        let tickerName: TickerTagType
        if (ticker instanceof TickerClass) {
            tickerName = ticker.constructor.name
        }
        else {
            tickerName = ticker.name
        }
        if (typeof childTag === "string") {
            childTag = [childTag]
        }
        GameWindowManager.currentTickers.map((t) => {
            if (t.className === tickerName) {
                t.childTags = t.childTags.filter((e) => !childTag.includes(e))
            }
            return t
        })
        GameWindowManager.removeTickersWithoutConnectedChild()
    }
    /**
     * Remove all tickers that are not connected to any existing child.
     */
    public static removeTickersWithoutConnectedChild() {
        let currentTickers = GameWindowManager.currentTickers
            .map((t) => {
                t.childTags = t.childTags.filter((e) => GameWindowManager.children[e])
                return t
            })
            .filter((t) => t.childTags.length > 0)
        GameWindowManager.currentTickers
            .filter((t) => !currentTickers.includes(t))
            .forEach((t) => {
                GameWindowManager.app.ticker.remove(t.fn)
            })
        GameWindowManager.currentTickers = currentTickers
    }
    /**
     * Get a ticker instance by the class name.
     * @param tickerName The name of the class.
     * @returns The ticker instance.
     */
    private static geTickerInstance<TArgs extends TickerArgsType>(tickerName: TickerTagType, args: TArgs, duration?: number, priority?: UPDATE_PRIORITY): TickerClass<TArgs> | undefined {
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
        GameWindowManager.currentTickers.forEach((t) => {
            GameWindowManager.app.ticker.remove(t.fn)
        })
        GameWindowManager.currentTickers = []
    }

    static registeredEvent: { [name: EventTagType]: typeof CanvasEvent } = {}

    /**
     * Clear the canvas and the tickers.
     */
    static clear() {
        GameWindowManager.removeChildren()
    }

    public static exportJson(): string {
        return JSON.stringify(this.export())
    }
    public static export(): ExportedCanvas {
        let currentElements: ICanvasBaseMemory[] = []
        for (let tag in GameWindowManager.children) {
            currentElements.push(GameWindowManager.children[tag].memory)
        }
        return {
            currentTickers: GameWindowManager.currentTickers,
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
                GameWindowManager.currentTickers = (data as ExportedCanvas)["currentTickers"]
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
