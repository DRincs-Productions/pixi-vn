import { ApplicationOptions, Container, Ticker } from "pixi.js";
import { CanvasSprite, CanvasText } from "../classes";
import CanvasBase from "../classes/canvas/CanvasBase";
import { setMemoryContainer } from "../classes/canvas/CanvasContainer";
import { setMemorySprite } from "../classes/canvas/CanvasSprite";
import { setMemoryText } from "../classes/canvas/CanvasText";
import TickerBase, { TickerArgsType } from "../classes/ticker/TickerBase";
import { Repeat } from "../constants";
import { geTickerInstanceById } from "../decorators/TickerDecorator";
import { createExportableElement } from "../functions/ExportUtility";
import { exportCanvasElement, importCanvasElement } from '../functions/canvas/CanvasMemoryUtility';
import { ExportedCanvas, ICanvasBaseMemory, ITicker, ITickersSteps, TickerHistory } from "../interface";
import { ITickersStep } from "../interface/ITickersSteps";
import { PauseType } from "../types/PauseType";
import { RepeatType } from "../types/RepeatType";
import { TickerIdType } from "../types/TickerIdType";
import { aliasToRemoveAfter } from '../types/ticker/AliasToRemoveAfterType';
import CanvasManagerStatic from './CanvasManagerStatic';

/**
 * This class is responsible for managing the canvas, the tickers, the events, and the window size and the children of the window.
 */
export default class CanvasManager {
    /**
     * The PIXI Application instance.
     * It not recommended to use this property directly.
     */
    get app() {
        return CanvasManagerStatic.app
    }
    /**
     * If the manager is initialized.
     */
    get isInitialized() {
        return CanvasManagerStatic._isInitialized
    }
    /**
     * This is the div that have same size of the canvas.
     * This is useful to put interface elements.
     * You can use React or other framework to put elements in this div.
     */
    get htmlLayout(): HTMLElement | undefined {
        return CanvasManagerStatic.htmlLayout
    }
    set htmlLayout(value: HTMLElement) {
        CanvasManagerStatic.htmlLayout = value
    }
    get canvasWidth() {
        return CanvasManagerStatic.canvasWidth
    }
    get canvasHeight() {
        return CanvasManagerStatic.canvasHeight
    }
    set canvasWidth(value: number) {
        CanvasManagerStatic.canvasWidth = value
    }
    set canvasHeight(value: number) {
        CanvasManagerStatic.canvasHeight = value
    }
    get screen() {
        return this.app.screen
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
    public async initialize(element: HTMLElement, width: number, height: number, options?: Partial<ApplicationOptions>): Promise<void> {
        return await CanvasManagerStatic.initialize(element, width, height, options)
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
    public initializeHTMLLayout(element: HTMLElement) {
        return CanvasManagerStatic.initializeHTMLLayout(element)
    }

    /* Edit Canvas Elements Methods */

    /**
     * This is a dictionary that contains all Canvas Elements of Canvas, currently.
     */
    get currentCanvasElements() {
        return CanvasManagerStatic._children
    }
    /**
     * Copy the properties of an old canvas element to a new canvas element.
     * @param oldAlias Old alias
     * @param newAlias New alias
     * @returns 
     */
    copyCanvasElementProperty<T extends ICanvasBaseMemory>(oldAlias: T | CanvasBase<T> | string, newAlias: CanvasBase<T> | string) {
        if (typeof newAlias === "string") {
            let element = this.find(newAlias)
            if (element) {
                newAlias = element
            }
            else {
                console.error(`[Pixi’VN] Canvas element ${newAlias} not found`)
                return
            }
        }
        if (typeof oldAlias === "string") {
            let element = this.find(oldAlias)
            if (element) {
                oldAlias = element
            }
            else {
                console.error(`[Pixi’VN] Canvas element ${oldAlias} not found`)
                return
            }
        }
        if (oldAlias instanceof Container) {
            oldAlias = oldAlias.memory
        }
        "isRenderGroup" in oldAlias && delete oldAlias.isRenderGroup
        "scale" in oldAlias && delete oldAlias.scale
        "visible" in oldAlias && delete oldAlias.visible
        "boundsArea" in oldAlias && delete oldAlias.boundsArea
        "textureImage" in oldAlias && delete oldAlias.textureImage
        "text" in oldAlias && delete oldAlias.text
        "resolution" in oldAlias && delete oldAlias.resolution
        "style" in oldAlias && delete oldAlias.style
        "height" in oldAlias && delete oldAlias.height
        "width" in oldAlias && delete oldAlias.width
        if (newAlias instanceof CanvasSprite) {
            setMemorySprite(newAlias, oldAlias)
        }
        else if (newAlias instanceof CanvasText) {
            setMemoryText(newAlias, oldAlias)
        }
        else if (newAlias instanceof Container) {
            setMemoryContainer(newAlias, oldAlias)
        }
    }
    /**
     * Transfer the tickers from an old alias to a new alias.
     * @param oldAlias Old alias
     * @param newAlias New alias
     * @param mode If "move", the old alias will be removed from the ticker. If "duplicate", the old alias will be kept in the ticker.
     */
    transferTickers(oldAlias: string, newAlias: string, mode: "move" | "duplicate" = "move") {
        for (let id in CanvasManagerStatic._currentTickers) {
            let ticker = CanvasManagerStatic._currentTickers[id]
            if (ticker.canvasElementAliases.includes(oldAlias)) {
                if (mode === "move") {
                    ticker.canvasElementAliases = ticker.canvasElementAliases.map((t) => t === oldAlias ? newAlias : t)
                }
                else if (mode === "duplicate") {
                    if (ticker.canvasElementAliases.find((t) => t === oldAlias)) {
                        ticker.canvasElementAliases.push(newAlias)
                    }
                }
                if (ticker.args.hasOwnProperty(aliasToRemoveAfter)) {
                    let aliasToRemoveAfter: string | string[] = ticker.args.aliasToRemoveAfter
                    if (typeof aliasToRemoveAfter === "string") {
                        aliasToRemoveAfter = [aliasToRemoveAfter]
                    }
                    if (Array.isArray(aliasToRemoveAfter)) {
                        if (mode === "move") {
                            ticker.args.aliasToRemoveAfter = aliasToRemoveAfter.map((t) => t === oldAlias ? newAlias : t)
                        }
                        else if (mode === "duplicate") {
                            if (aliasToRemoveAfter.find((t) => t === oldAlias)) {
                                ticker.args.aliasToRemoveAfter = [...aliasToRemoveAfter, newAlias]
                            }
                        }
                    }
                }
            }
        }
        for (let timeout in CanvasManagerStatic._currentTickersTimeouts) {
            let TickerTimeout = CanvasManagerStatic._currentTickersTimeouts[timeout]
            if (TickerTimeout.aliases.includes(oldAlias)) {
                if (mode === "move") {
                    TickerTimeout.aliases = TickerTimeout.aliases.map((t) => t === oldAlias ? newAlias : t)
                }
                else if (mode === "duplicate") {
                    if (TickerTimeout.aliases.find((t) => t === oldAlias)) {
                        TickerTimeout.aliases.push(newAlias)
                    }
                }
            }
        }
    }
    /**
     * Add a canvas element to the canvas.
     * If there is a canvas element with the same alias, it will be removed.
     * @param alias The alias of the canvas element.
     * @param canvasElement The canvas elements to be added.
     * @param options The options of the canvas element.
     * @example
     * ```typescript
     * const texture = await Assets.load('https://pixijs.com/assets/bunny.png');
     * const sprite = CanvasSprite.from(texture);
     * canvas.add("bunny", sprite);
     * ```
     */
    public add(alias: string, canvasElement: CanvasBase<any>, options: {
        /**
         * If there is a canvas element with the same alias, the "style" of the old canvas element will be imported to the new canvas element.
         * @default false
         */
        ignoreOldStyle?: boolean
    } = {}) {
        let ignoreOldStyle = options?.ignoreOldStyle
        let oldCanvasElement = this.find(alias)
        if (oldCanvasElement) {
            let zIndex = oldCanvasElement.zIndex
            !ignoreOldStyle && this.copyCanvasElementProperty(oldCanvasElement, canvasElement)
            this.remove(alias, { ignoreTickers: true })
            this.app.stage.addChildAt(canvasElement, zIndex)
        }
        else {
            this.app.stage.addChild(canvasElement)
        }
        CanvasManagerStatic._children[alias] = canvasElement
        CanvasManagerStatic.elementAliasesOrder.push(alias)
    }
    /**
     * @deprecated use canvas.add
     */
    public addCanvasElement(alias: string, canvasElement: CanvasBase<any>) {
        this.add(alias, canvasElement)
    }
    /**
     * Remove a canvas element from the canvas.
     * And remove all tickers that are not connected to any canvas element.
     * @param alias The alias of the canvas element to be removed.
     * @param options The options of the canvas element.
     * @returns 
     * @example
     * ```typescript
     * canvas.remove("bunny");
     * ```
     */
    public remove(alias: string | string[], options: {
        /**
         * If true, the tickers that are connected to the canvas element will not be removed.
         * @default false
         */
        ignoreTickers?: boolean
    } = {}) {
        let ignoreTickers = options.ignoreTickers
        if (typeof alias === "string") {
            alias = [alias]
        }
        alias.forEach((alias) => {
            if (CanvasManagerStatic._children[alias]) {
                this.app.stage.removeChild(CanvasManagerStatic._children[alias])
                delete CanvasManagerStatic._children[alias]
                !ignoreTickers && this.removeTickerByCanvasElement(alias)
            }
        })
        CanvasManagerStatic.elementAliasesOrder = CanvasManagerStatic.elementAliasesOrder.filter((t) => !alias.includes(t))
    }
    /**
     * @deprecated use canvas.remove
     */
    public removeCanvasElement(alias: string | string[]) {
        this.remove(alias)
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
    public find<T extends CanvasBase<any>>(alias: string): T | undefined {
        return CanvasManagerStatic._children[alias] as T | undefined
    }
    /**
     * @deprecated use canvas.find
     */
    public getCanvasElement<T extends CanvasBase<any>>(alias: string): T | undefined {
        return this.find<T>(alias)
    }
    /**
     * Check if a DisplayObject is on the canvas.
     * @param pixiElement The DisplayObject to be checked.
     * @returns If the DisplayObject is on the canvas.
     */
    public canvasElementIsOnCanvas<T extends Container>(pixiElement: T) {
        return this.app.stage.children.includes(pixiElement)
    }
    /**
     * Remove all canvas elements from the canvas.
     * And remove all tickers that are not connected to any canvas element.
     */
    public removeAll() {
        this.app.stage.removeChildren()
        CanvasManagerStatic._children = {}
        CanvasManagerStatic.elementAliasesOrder = []
        this.removeAllTickers()
    }
    /**
     * Edit the alias of a canvas element.
     * @param oldAlias The old alias of the canvas element.
     * @param newAlias The new alias of the canvas element.
     */
    public editAlias(oldAlias: string, newAlias: string) {
        if (CanvasManagerStatic._children[oldAlias]) {
            CanvasManagerStatic._children[newAlias] = CanvasManagerStatic._children[oldAlias]
            delete CanvasManagerStatic._children[oldAlias]
        }
        if (CanvasManagerStatic._currentTickersSteps[oldAlias]) {
            CanvasManagerStatic._currentTickersSteps[newAlias] = CanvasManagerStatic._currentTickersSteps[oldAlias]
            delete CanvasManagerStatic._currentTickersSteps[oldAlias]
        }
        this.transferTickers(oldAlias, newAlias, "move")
    }

    /** Edit Tickers Methods */

    /**
     * Currently tickers that are running.
     */
    public get currentTickers() {
        return CanvasManagerStatic._currentTickers
    }
    public get currentTickersList() {
        return Object.values(CanvasManagerStatic._currentTickers)
    }
    /**
     * The steps of the tickers
     */
    public get currentTickersSteps() {
        return CanvasManagerStatic._currentTickersSteps
    }
    /**
     * Run a ticker. You can run multiple addTicker with the same alias and different tickerClasses.
     * If you run a ticker with the same alias and tickerClass, the old ticker will be removed.
     * If already exists a sequence of tickers with the same alias, it will be removed.
     * @param canvasElementAlias The alias of the canvas element that will use the ticker.
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
    addTicker<TArgs extends TickerArgsType>(canvasElementAlias: string | string[], ticker: TickerBase<TArgs>) {
        let tickerId: TickerIdType = ticker.id
        if (typeof canvasElementAlias === "string") {
            canvasElementAlias = [canvasElementAlias]
        }
        if (!geTickerInstanceById<TArgs>(tickerId, ticker.args, ticker.duration, ticker.priority)) {
            console.error(`[Pixi’VN] Ticker ${tickerId} not found`)
            return
        }
        let tickerHistory: TickerHistory<TArgs> = {
            fn: () => { },
            id: tickerId,
            args: createExportableElement(ticker.args),
            canvasElementAliases: canvasElementAlias,
            priority: ticker.priority,
            duration: ticker.duration,
        }
        let id = CanvasManagerStatic.generateTickerId(tickerHistory)
        this.pushTicker(id, tickerHistory, ticker)
        if (ticker.duration) {
            let timeout = setTimeout(() => {
                CanvasManagerStatic.removeTickerTimeoutInfo(timeout)
                let tickerTimeoutInfo = CanvasManagerStatic._currentTickersTimeouts[timeout.toString()]
                if (tickerTimeoutInfo) {
                    this.removeTicker(id)
                }
            }, ticker.duration * 1000);
            CanvasManagerStatic.addTickerTimeoutInfo(canvasElementAlias, tickerId, timeout.toString(), true)
        }
    }
    private pushTicker<TArgs extends TickerArgsType>(id: string, tickerData: TickerHistory<TArgs>, ticker: TickerBase<TArgs>) {
        this.removeAssociationBetweenTickerCanvasElement(tickerData.canvasElementAliases, ticker)
        CanvasManagerStatic._currentTickers[id] = tickerData
        tickerData.fn = (t: Ticker) => {
            let data = CanvasManagerStatic._currentTickers[id]
            if (data) {
                ticker?.fn(t, data.args, data.canvasElementAliases, id)
            }
        }
        this.app.ticker.add(tickerData.fn, undefined, tickerData.priority)
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
    addTickersSteps<TArgs extends TickerArgsType>(alias: string, steps: (ITicker<TArgs> | RepeatType | PauseType)[], currentStepNumber = 0) {
        if (steps.length == 0) {
            console.warn("[Pixi’VN] The steps of the tickers is empty")
            return
        }
        this.removeTickerStepByCanvasElement(alias)
        CanvasManagerStatic._currentTickersSteps[alias] = {
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
        this.runTickersSteps(alias)
    }
    private restoneTickersSteps(data: { [alias: string]: ITickersSteps }) {
        for (let alias in data) {
            let steps = data[alias]
            CanvasManagerStatic._currentTickersSteps[alias] = steps
            this.runTickersSteps(alias)
        }
    }
    private runTickersSteps<TArgs extends TickerArgsType>(alias: string) {
        let step = CanvasManagerStatic._currentTickersSteps[alias].steps[CanvasManagerStatic._currentTickersSteps[alias].currentStepNumber]
        if (step === Repeat) {
            step = CanvasManagerStatic._currentTickersSteps[alias].steps[0]
            CanvasManagerStatic._currentTickersSteps[alias].currentStepNumber = 0
            if (step === Repeat) {
                console.error("[Pixi’VN] TikersSteps has a RepeatType in the first step")
                return
            }
        }
        if (step.hasOwnProperty("type") && (step as PauseType).type === "pause") {
            let timeout = setTimeout(() => {
                let tickerTimeoutInfo = CanvasManagerStatic._currentTickersTimeouts[timeout.toString()]
                if (tickerTimeoutInfo) {
                    tickerTimeoutInfo.aliases.forEach((alias) => {
                        this.nextTickerStep(alias)
                    })
                }
                CanvasManagerStatic.removeTickerTimeoutInfo(timeout)
            }, (step as PauseType).duration * 1000);
            CanvasManagerStatic.addTickerTimeoutInfo(alias, "steps", timeout.toString(), false)
            return
        }
        let ticker = geTickerInstanceById<TArgs>((step as ITickersStep<TArgs>).ticker, (step as ITickersStep<TArgs>).args, step.duration, (step as ITickersStep<TArgs>).priority)
        if (!ticker) {
            console.error(`[Pixi’VN] Ticker ${(step as ITickersStep<TArgs>).ticker} not found`)
            return
        }
        let tickerName: TickerIdType = ticker.id
        let tickerHistory: TickerHistory<TArgs> = {
            fn: () => { },
            id: tickerName,
            args: createExportableElement(ticker.args),
            canvasElementAliases: [alias],
            priority: ticker.priority,
            duration: ticker.duration,
            createdByTicketStepsId: alias,
        }
        let id = CanvasManagerStatic.generateTickerId(tickerHistory)
        this.pushTicker(id, tickerHistory, ticker)
        if (ticker.duration) {
            let timeout = setTimeout(() => {
                let tickerTimeoutInfo = CanvasManagerStatic._currentTickersTimeouts[timeout.toString()]
                if (tickerTimeoutInfo) {
                    this.removeTicker(id)
                    tickerTimeoutInfo.aliases.forEach((alias) => {
                        this.nextTickerStep(alias)
                    })
                }
                CanvasManagerStatic.removeTickerTimeoutInfo(timeout)
            }, ticker.duration * 1000);
            CanvasManagerStatic.addTickerTimeoutInfo(alias, tickerName, timeout.toString(), false)
        }
    }
    private nextTickerStep(alias: string) {
        if (CanvasManagerStatic._currentTickersSteps[alias]) {
            let steps = CanvasManagerStatic._currentTickersSteps[alias]
            if (steps.currentStepNumber + 1 < steps.steps.length) {
                steps.currentStepNumber++
                CanvasManagerStatic._currentTickersSteps[alias] = steps
                this.runTickersSteps(alias)
            }
            else {
                this.removeTickerStepByCanvasElement(alias)
            }
        }
    }
    public onEndOfTicker(alias: string | string[], ticker: typeof TickerBase<any> | TickerBase<any> | string, aliasToDelete: string | string[], tickerId: string) {
        let tickerData = CanvasManagerStatic._currentTickers[tickerId]
        this.removeAssociationBetweenTickerCanvasElement(alias, ticker)
        this.remove(aliasToDelete)
        if (tickerData) {
            this.removeTicker(tickerId)
            if (tickerData.duration == undefined && tickerData.createdByTicketStepsId) {
                this.nextTickerStep(tickerData.createdByTicketStepsId)
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
    public removeAssociationBetweenTickerCanvasElement(alias: string | string[], ticker: typeof TickerBase<any> | TickerBase<any> | string) {
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
        for (let id in CanvasManagerStatic._currentTickers) {
            let ticker = CanvasManagerStatic._currentTickers[id]
            if (ticker.id === tickerId) {
                CanvasManagerStatic._currentTickers[id].canvasElementAliases = ticker.canvasElementAliases.filter((e) => !alias.includes(e))
            }
        }
        for (let timeout in CanvasManagerStatic._currentTickersTimeouts) {
            let TickerTimeout = CanvasManagerStatic._currentTickersTimeouts[timeout]
            if (TickerTimeout.ticker === tickerId && TickerTimeout.canBeDeletedBeforeEnd) {
                CanvasManagerStatic._currentTickersTimeouts[timeout].aliases = TickerTimeout.aliases.filter((t) => !alias.includes(t))
            }
        }
        this.removeTickersWithoutAssociatedCanvasElement()
    }
    /**
     * Remove all tickers that are not connected to any existing canvas element.
     */
    private removeTickersWithoutAssociatedCanvasElement() {
        for (let id in CanvasManagerStatic._currentTickers) {
            let ticker = CanvasManagerStatic._currentTickers[id]
            ticker.canvasElementAliases = ticker.canvasElementAliases.filter((e) => CanvasManagerStatic._children[e])
            if (ticker.canvasElementAliases.length === 0) {
                this.removeTicker(id)
            }
        }
        for (let alias in CanvasManagerStatic._currentTickersSteps) {
            if (CanvasManagerStatic._children[alias] === undefined) {
                delete CanvasManagerStatic._currentTickersSteps[alias]
            }
        }
        Object.entries(CanvasManagerStatic._currentTickersTimeouts).forEach(([timeout, { aliases: aliases }]) => {
            if (aliases.length === 0) {
                CanvasManagerStatic.removeTickerTimeout(timeout)
            }
        })
    }
    /**
     * Remove all tickers from the canvas.
     */
    public removeAllTickers() {
        CanvasManagerStatic._currentTickersSteps = {}
        Object.keys(CanvasManagerStatic._currentTickers).forEach((id) => {
            this.removeTicker(id)
        })
        CanvasManagerStatic._currentTickers = {}
        for (let timeout in CanvasManagerStatic._currentTickersTimeouts) {
            CanvasManagerStatic.removeTickerTimeout(timeout)
        }
    }
    /**
     * Remove all tickers from a canvas element.
     * @param alias The alias of the canvas element that will use the ticker.
     */
    private removeTickerByCanvasElement(alias: string | string[]) {
        if (typeof alias === "string") {
            alias = [alias]
        }
        alias.forEach((alias) => {
            for (let id in CanvasManagerStatic._currentTickers) {
                let ticker = CanvasManagerStatic._currentTickers[id]
                if (ticker.canvasElementAliases.includes(alias)) {
                    this.removeTicker(id)
                }
            }
            if (CanvasManagerStatic._currentTickersSteps[alias]) {
                delete CanvasManagerStatic._currentTickersSteps[alias]
            }
            CanvasManagerStatic.removeTickerTimeoutsByAlias(alias, false)
            delete CanvasManagerStatic._currentTickersSteps[alias]
        })
    }
    private removeTickerStepByCanvasElement(alias: string) {
        if (CanvasManagerStatic._currentTickersSteps[alias]) {
            delete CanvasManagerStatic._currentTickersSteps[alias]
        }
        for (let id in CanvasManagerStatic._currentTickers) {
            let ticker = CanvasManagerStatic._currentTickers[id]
            if (ticker.createdByTicketStepsId === alias) {
                this.removeTicker(id)
            }
        }
    }
    private removeTicker(tickerId: string) {
        let ticker = CanvasManagerStatic._currentTickers[tickerId]
        if (ticker) {
            if (ticker.args.hasOwnProperty(aliasToRemoveAfter)) {
                let aliasToRemoveAfter: string | string[] = ticker.args.aliasToRemoveAfter
                this.remove(aliasToRemoveAfter)
            }
            this.app.ticker.remove(ticker.fn)
            delete CanvasManagerStatic._currentTickers[tickerId]
        }
    }

    /* Other Methods */

    /**
     * Extract the canvas as an image.
     * @returns The image as a base64 string.
     */
    async extractImage() {
        const image = await this.app.renderer.extract.image(this.app.stage)
        return image.src
    }

    /**
     * Clear the canvas and the tickers.
     */
    clear() {
        this.removeAll()
    }

    /* Export and Import Methods */

    /**
     * Export the canvas and the tickers to a JSON string.
     * @returns The JSON string.
     */
    public exportJson(): string {
        return JSON.stringify(this.export())
    }
    /**
     * Export the canvas and the tickers to an object.
     * @returns The object.
     */
    public export(): ExportedCanvas {
        let currentElements: { [alias: string]: ICanvasBaseMemory } = {}
        for (let alias in CanvasManagerStatic._children) {
            currentElements[alias] = exportCanvasElement(CanvasManagerStatic._children[alias])
        }
        return {
            tickers: createExportableElement(CanvasManagerStatic.currentTickersWithoutCreatedBySteps),
            tickersSteps: createExportableElement(CanvasManagerStatic._currentTickersSteps),
            elements: createExportableElement(currentElements),
            elementAliasesOrder: createExportableElement(CanvasManagerStatic.elementAliasesOrder),
        }
    }
    /**
     * Import the canvas and the tickers from a JSON string.
     * @param dataString The JSON string.
     */
    public importJson(dataString: string) {
        this.import(JSON.parse(dataString))
    }
    /**
     * Import the canvas and the tickers from an object.
     * @param data The object.
     */
    public import(data: object) {
        this.clear()
        try {
            if (data.hasOwnProperty("elementAliasesOrder") && data.hasOwnProperty("elements")) {
                let currentElements = (data as ExportedCanvas)["elements"]
                let elementAliasesOrder = (data as ExportedCanvas)["elementAliasesOrder"]
                elementAliasesOrder.forEach((alias) => {
                    if (currentElements[alias]) {
                        let element = importCanvasElement(currentElements[alias])
                        this.add(alias, element)
                        CanvasManagerStatic.elementAliasesOrder.push(alias)
                    }
                })
            }
            else {
                console.error("[Pixi’VN] The data does not have the properties elementAliasesOrder and elements")
                return
            }
            if (data.hasOwnProperty("tickers")) {
                let tickers = (data as ExportedCanvas)["tickers"]
                for (let id in tickers) {
                    let t = tickers[id]
                    let aliases: string[] = t.canvasElementAliases
                    let ticker = geTickerInstanceById(t.id, t.args, t.duration, t.priority)
                    if (ticker) {
                        this.addTicker(aliases, ticker)
                    }
                    else {
                        console.error(`[Pixi’VN] Ticker ${t.id} not found`)
                    }
                }
            }
            if (data.hasOwnProperty("tickersSteps")) {
                let tickersSteps = (data as ExportedCanvas)["tickersSteps"]
                this.restoneTickersSteps(tickersSteps)
            }
        }
        catch (e) {
            console.error("[Pixi’VN] Error importing data", e)
        }
    }
}
