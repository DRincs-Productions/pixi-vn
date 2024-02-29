import { Application, DisplayObject, IApplicationOptions, UPDATE_PRIORITY } from "pixi.js";
import { TickerArgsType, TickerClass } from "../classes/TickerClass";
import { CanvasBase } from "../classes/canvas/CanvasBase";
import { IClassWithArgsHistory } from "../interface/IClassWithArgsHistory";
import { ICanvasBaseMemory } from "../interface/canvas/ICanvasBaseMemory";
import { ExportedCanvas } from "../interface/export/ExportedCanvas";
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
    static interfaceDiv: HTMLElement
    static width: number
    static height: number

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

        let div = document.createElement('div')
        div.style.position = 'absolute'
        GameWindowManager.interfaceDiv = div

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
     * Add the interface div into a html element.
     * @param element it is the html element where I will put the interface div. Example: document.getElementById('root')
     */
    public static addInterfaceIntoElement(element: HTMLElement) {
        element.appendChild(GameWindowManager.interfaceDiv)
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

        if (!GameWindowManager.interfaceDiv) {
            console.error("Manager.interfaceDiv is undefined")
        }
        else {
            GameWindowManager.interfaceDiv.style.width = `${GameWindowManager.enlargedWidth}px`
            GameWindowManager.interfaceDiv.style.height = `${GameWindowManager.enlargedHeight}px`
            GameWindowManager.interfaceDiv.style.marginLeft = `${GameWindowManager.horizontalMargin}px`
            GameWindowManager.interfaceDiv.style.marginRight = `${GameWindowManager.horizontalMargin}px`
            GameWindowManager.interfaceDiv.style.marginTop = `${GameWindowManager.verticalMargin}px`
            GameWindowManager.interfaceDiv.style.marginBottom = `${GameWindowManager.verticalMargin}px`
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
    }
    /**
     * Get a child from the canvas.
     * @param tag The tag of the child to be returned.
     * @returns The child with the tag.
     */
    public static getChild<T extends CanvasBase<any, any>>(tag: string): T | undefined {
        return GameWindowManager.children[tag] as T | undefined
    }
    public static getChilds<T extends CanvasBase<any, any>>(tags: string[]): T[] {
        let elements: T[] = []
        tags.forEach((tag) => {
            let e = GameWindowManager.getChild<T>(tag)
            if (e) {
                elements.push(e)
            }
        })
        return elements
    }
    /**
     * Remove all children from the canvas.
     */
    public static removeChildren() {
        GameWindowManager.app.stage.removeChildren()
        GameWindowManager.children = {}
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
    public static removeChildWithDisplayObject(child: CanvasBase<any, any> | DisplayObject) {
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
    static currentTickers: IClassWithArgsHistory[] = []
    /**
     * Run a ticker.
     * @param childTag The tag of the child that will use the ticker.
     * @param ticker The ticker class to be run.
     * @param args The arguments to be used in the ticker.
     * @param priority The priority to be used in the ticker.
     * @returns 
     */
    static addTicker<TArgs extends TickerArgsType>(childTag: string | string[], ticker: typeof TickerClass<TArgs>, args: TArgs, priority?: UPDATE_PRIORITY) {
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
        let t = GameWindowManager.geTickerByClassName<TArgs>(tickerName)
        let tickerKey = tickerName + "$" + args.toString()
        if (!t) {
            console.error(`Ticker ${tickerName} not found`)
            return
        }
        let tickerFun = (dt: number) => {
            let elements = GameWindowManager.getChilds(childTag as string[])
            t?.fn(dt, args, elements)
        }
        let tickerHistory: IClassWithArgsHistory | undefined = GameWindowManager.getTickerById(tickerKey)
        if (tickerHistory) {
            GameWindowManager.app.ticker.remove(tickerHistory.fn)
            tickerHistory.elements = tickerHistory.elements.filter((e) => !childTag.includes(e)).concat(childTag)
            tickerHistory.fn = tickerFun
        }
        else {
            tickerHistory = {
                id: tickerKey,
                fn: tickerFun,
                className: tickerName,
                args: args,
                elements: childTag,
                priority: priority
            }
        }
        GameWindowManager.currentTickers.push(tickerHistory)
        GameWindowManager.app.ticker.add(tickerFun, undefined, priority)
        GameWindowManager.removeTickersWithoutConnectedChild()
    }
    private static getTickerById(id: string): IClassWithArgsHistory | undefined {
        GameWindowManager.currentTickers.forEach((t) => {
            if (t.id === id) {
                return t
            }
        })
        return
    }
    public static removeTickerConnectedToChild(childTag: string | string[], ticker: typeof TickerClass<any>) {
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
                t.elements = t.elements.filter((e) => !childTag.includes(e))
            }
            return t
        })
        GameWindowManager.removeTickersWithoutConnectedChild()
    }
    public static removeTickersWithoutConnectedChild() {
        GameWindowManager.currentTickers = GameWindowManager.currentTickers
            .map((t) => {
                t.elements = t.elements.filter((e) => GameWindowManager.children[e])
                return t
            })
            .filter((t) => t.elements.length > 0)
    }

    private static geTickerByClassName<TArgs extends TickerArgsType>(labelName: TickerTagType): TickerClass<TArgs> | undefined {
        try {
            let ticker = GameWindowManager.registeredTicker[labelName]
            if (!ticker) {
                console.error(`Ticker ${labelName} not found`)
                return
            }
            return new ticker()
        }
        catch (e) {
            console.error(e)
            return
        }
    }

    static clear() {
        GameWindowManager.removeChildren()
        // TODO remove tickers
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
