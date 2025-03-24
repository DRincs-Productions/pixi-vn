import { Devtools } from "@pixi/devtools";
import { ApplicationOptions, Container as PixiContainer } from "pixi.js";
import { CANVAS_APP_GAME_LAYER_ALIAS, Repeat } from "../constants";
import { createExportableElement } from "../utils/export-utility";
import { logger } from "../utils/log-utility";
import CanvasManagerStatic from "./CanvasManagerStatic";
import CanvasBaseItem from "./classes/CanvasBaseItem";
import { setMemoryContainer } from "./components/Container";
import ImageContainer, { setMemoryImageContainer } from "./components/ImageContainer";
import ImageSprite, { setMemoryImageSprite } from "./components/ImageSprite";
import Sprite, { setMemorySprite } from "./components/Sprite";
import Text, { setMemoryText } from "./components/Text";
import VideoSprite, { setMemoryVideoSprite } from "./components/VideoSprite";
import { importCanvasElement } from "./functions/canvas-import-utility";
import { exportCanvasElement, getMemoryContainer } from "./functions/canvas-memory-utility";
import CanvasGamState from "./interfaces/CanvasGamState";
import CanvasManagerInterface from "./interfaces/CanvasManagerInterface";
import CanvasBaseItemMemory from "./interfaces/memory/CanvasBaseItemMemory";
import { Ticker, TickerArgs, TickerHistory, TickerValue } from "./tickers";
import TickerBase from "./tickers/classes/TickerBase";
import { getTickerInstanceById } from "./tickers/decorators/ticker-decorator";
import TickersSequence, { TickersStep } from "./tickers/interfaces/TickersSequence";
import { aliasToRemoveAfter } from "./tickers/types/AliasToRemoveAfterType";
import PauseTickerType from "./types/PauseTickerType";
import { PauseType } from "./types/PauseType";
import { RepeatType } from "./types/RepeatType";
import { TickerIdType } from "./types/TickerIdType";

/**
 * This class is responsible for managing the canvas, the tickers, the events, and the window size and the children of the window.
 */
export default class CanvasManager implements CanvasManagerInterface {
    get app() {
        return CanvasManagerStatic.app;
    }
    get gameLayer() {
        return CanvasManagerStatic.gameLayer;
    }
    get isInitialized() {
        return CanvasManagerStatic._isInitialized;
    }
    get htmlLayout(): HTMLElement | undefined {
        return CanvasManagerStatic.htmlLayout;
    }
    set htmlLayout(value: HTMLElement) {
        CanvasManagerStatic.htmlLayout = value;
    }
    get canvasWidth() {
        return CanvasManagerStatic.canvasWidth;
    }
    get canvasHeight() {
        return CanvasManagerStatic.canvasHeight;
    }
    set canvasWidth(value: number) {
        CanvasManagerStatic.canvasWidth = value;
    }
    set canvasHeight(value: number) {
        CanvasManagerStatic.canvasHeight = value;
    }
    get screen() {
        return this.app.screen;
    }

    public async initialize(
        element: HTMLElement,
        widthOrOptions: (Partial<ApplicationOptions> & { width: number; height: number }) | number,
        heightOrDevtoolsOptions?: Devtools | number,
        options?: Partial<ApplicationOptions>,
        devtoolsOptions?: Devtools
    ): Promise<void> {
        if (typeof widthOrOptions === "number" && typeof heightOrDevtoolsOptions === "number") {
            return await CanvasManagerStatic.initialize(
                element,
                widthOrOptions,
                heightOrDevtoolsOptions,
                options,
                devtoolsOptions
            );
        } else if (typeof widthOrOptions !== "number" && typeof heightOrDevtoolsOptions !== "number") {
            return await CanvasManagerStatic.initialize(
                element,
                widthOrOptions.width,
                widthOrOptions.height,
                widthOrOptions,
                heightOrDevtoolsOptions
            );
        } else {
            throw new Error("Invalid parameters");
        }
    }

    public initializeHTMLLayout(element: HTMLElement) {
        return CanvasManagerStatic.initializeHTMLLayout(element);
    }

    /* Edit Canvas Elements Methods */

    get children() {
        return CanvasManagerStatic.gameLayer.children;
    }
    async copyCanvasElementProperty<T extends CanvasBaseItemMemory>(
        oldAlias: T | CanvasBaseItem<T> | string,
        newAlias: CanvasBaseItem<T> | string
    ) {
        if (typeof newAlias === "string") {
            let element = this.find(newAlias);
            if (element) {
                newAlias = element;
            } else {
                logger.error(`Canvas element ${newAlias} not found`);
                return;
            }
        }
        if (typeof oldAlias === "string") {
            let element = this.find(oldAlias);
            if (element) {
                oldAlias = element;
            } else {
                logger.error(`Canvas element ${oldAlias} not found`);
                return;
            }
        }
        if (oldAlias instanceof PixiContainer) {
            oldAlias = oldAlias.memory;
        }
        "isRenderGroup" in oldAlias && delete oldAlias.isRenderGroup;
        "scale" in oldAlias && delete oldAlias.scale;
        "visible" in oldAlias && delete oldAlias.visible;
        "boundsArea" in oldAlias && delete oldAlias.boundsArea;
        "text" in oldAlias && delete oldAlias.text;
        "resolution" in oldAlias && delete oldAlias.resolution;
        "style" in oldAlias && delete oldAlias.style;
        "height" in oldAlias && delete oldAlias.height;
        "width" in oldAlias && delete oldAlias.width;
        if (newAlias instanceof VideoSprite) {
            await setMemoryVideoSprite(newAlias, oldAlias, { ignoreTexture: true });
        } else if (newAlias instanceof ImageSprite) {
            await setMemoryImageSprite(newAlias, oldAlias, { ignoreTexture: true });
        } else if (newAlias instanceof Sprite) {
            await setMemorySprite(newAlias, oldAlias, { ignoreTexture: true });
        } else if (newAlias instanceof Text) {
            await setMemoryText(newAlias, oldAlias);
        } else if (newAlias instanceof ImageContainer) {
            await setMemoryImageContainer(newAlias, oldAlias);
        } else if (newAlias instanceof PixiContainer) {
            await setMemoryContainer(newAlias, oldAlias);
        }
    }
    transferTickers(oldAlias: string, newAlias: string, mode: "move" | "duplicate" = "move") {
        if (CanvasManagerStatic._currentTickersSequence[oldAlias]) {
            if (mode === "move") {
                CanvasManagerStatic._currentTickersSequence[newAlias] = createExportableElement(
                    CanvasManagerStatic._currentTickersSequence[oldAlias]
                );
            } else if (mode === "duplicate") {
                CanvasManagerStatic._currentTickersSequence[newAlias] = createExportableElement(
                    CanvasManagerStatic._currentTickersSequence[oldAlias]
                );
            }
        }
        Object.entries(CanvasManagerStatic._currentTickers).forEach(([id, ticker]) => {
            if (ticker.createdByTicketSteps?.canvasElementAlias === oldAlias) {
                this.removeTicker(id);
            }
            if (ticker.canvasElementAliases.includes(oldAlias)) {
                if (mode === "move") {
                    ticker.canvasElementAliases = ticker.canvasElementAliases.map((t) =>
                        t === oldAlias ? newAlias : t
                    );
                } else if (mode === "duplicate") {
                    if (ticker.canvasElementAliases.find((t) => t === oldAlias)) {
                        ticker.canvasElementAliases.push(newAlias);
                    }
                }
                if (ticker.args.hasOwnProperty(aliasToRemoveAfter)) {
                    let aliasToRemoveAfter: string | string[] = ticker.args.aliasToRemoveAfter;
                    if (typeof aliasToRemoveAfter === "string") {
                        aliasToRemoveAfter = [aliasToRemoveAfter];
                    }
                    if (Array.isArray(aliasToRemoveAfter)) {
                        if (mode === "move") {
                            ticker.args.aliasToRemoveAfter = aliasToRemoveAfter.map((t) =>
                                t === oldAlias ? newAlias : t
                            );
                        } else if (mode === "duplicate") {
                            if (aliasToRemoveAfter.find((t) => t === oldAlias)) {
                                ticker.args.aliasToRemoveAfter = [...aliasToRemoveAfter, newAlias];
                            }
                        }
                    }
                }
            }
        });
        Object.values(CanvasManagerStatic._currentTickersTimeouts).forEach((tickerTimeout) => {
            if (tickerTimeout.aliases.includes(oldAlias)) {
                if (mode === "move") {
                    tickerTimeout.aliases = tickerTimeout.aliases.map((t) => (t === oldAlias ? newAlias : t));
                } else if (mode === "duplicate") {
                    if (tickerTimeout.aliases.find((t) => t === oldAlias)) {
                        tickerTimeout.aliases.push(newAlias);
                    }
                }
            }
        });
        if (CanvasManagerStatic._currentTickersSequence[newAlias]) {
            Object.keys(CanvasManagerStatic._currentTickersSequence[newAlias]).forEach((key) => {
                this.runTickersSequence(newAlias, key);
            });
        }
        if (mode === "duplicate" && CanvasManagerStatic._currentTickersSequence[oldAlias]) {
            Object.keys(CanvasManagerStatic._currentTickersSequence[oldAlias]).forEach((key) => {
                this.runTickersSequence(oldAlias, key);
            });
        }
    }
    public add(
        alias: string,
        canvasComponent: CanvasBaseItem<any>,
        options: {
            /**
             * If there is a canvas element with the same alias, the "style" of the old canvas element will be imported to the new canvas element.
             * @default false
             */
            ignoreOldStyle?: boolean;
            /**
             * The zIndex of the canvas element.
             * @default undefined
             */
            zIndex?: number;
        } = {}
    ) {
        if (alias === CANVAS_APP_GAME_LAYER_ALIAS) {
            logger.error(`The alias ${CANVAS_APP_GAME_LAYER_ALIAS} is reserved`);
            return;
        }

        let oldCanvasElement = this.find(alias);

        let ignoreOldStyle = options?.ignoreOldStyle;
        if (oldCanvasElement && !ignoreOldStyle) {
            this.copyCanvasElementProperty(oldCanvasElement, canvasComponent);
        }

        let zIndex = options.zIndex;
        if (oldCanvasElement && !this.gameLayer.children.includes(oldCanvasElement)) {
            logger.error(
                `The canvas element ${alias} exist in the memory but it is not on the canvas, so the zIndex is not set`
            );
        } else if (oldCanvasElement) {
            zIndex === undefined && (zIndex = this.gameLayer.getChildIndex(oldCanvasElement));
            this.remove(alias, { ignoreTickers: true });
        }

        if (zIndex !== undefined) {
            canvasComponent.label = alias;
            this.gameLayer.addChildAt(canvasComponent, zIndex);
        } else {
            canvasComponent.label = alias;
            this.gameLayer.addChild(canvasComponent);
        }
    }
    /**
     * @deprecated use canvas.add
     */
    public addCanvasElement(alias: string, canvasElement: CanvasBaseItem<any>) {
        this.add(alias, canvasElement);
    }
    public remove(
        alias: string | string[],
        options: {
            /**
             * If true, the tickers that are connected to the canvas element will not be removed.
             * @default false
             */
            ignoreTickers?: boolean;
        } = {}
    ) {
        if (alias === CANVAS_APP_GAME_LAYER_ALIAS) {
            logger.error(`The alias ${CANVAS_APP_GAME_LAYER_ALIAS} is reserved`);
            return;
        }
        let ignoreTickers = options.ignoreTickers;
        if (typeof alias === "string") {
            alias = [alias];
        }
        alias.forEach((alias) => {
            this.gameLayer.getChildrenByLabel(alias).forEach((canvasComponent) => {
                this.gameLayer.removeChild(canvasComponent);
                !ignoreTickers && this.unlinkComponentFromTicker(alias);
            });
        });
    }
    /**
     * @deprecated use canvas.remove
     */
    public removeCanvasElement(alias: string | string[]) {
        this.remove(alias);
    }
    public find<T extends CanvasBaseItem<any>>(alias: string): T | undefined {
        if (alias === CANVAS_APP_GAME_LAYER_ALIAS) {
            return this.gameLayer as T;
        }
        let canvasComponent = this.gameLayer.getChildByLabel(alias);
        if (canvasComponent) {
            return canvasComponent as T;
        }
        return undefined;
    }
    /**
     * @deprecated use canvas.find
     */
    public getCanvasElement<T extends CanvasBaseItem<any>>(alias: string): T | undefined {
        return this.find<T>(alias);
    }
    public canvasElementIsOnCanvas<T extends PixiContainer>(pixiElement: T) {
        return this.gameLayer.children.includes(pixiElement);
    }
    public removeAll() {
        this.gameLayer.removeChildren();
        this.removeAllTickers();
    }
    public editAlias(
        oldAlias: string,
        newAlias: string,
        options: {
            /**
             * If true, the tickers that are connected to the canvas element will not be transferred.
             * @default false
             */
            ignoreTickers?: boolean;
        } = {}
    ) {
        let canvasComponent = this.find(oldAlias);
        if (canvasComponent) {
            canvasComponent.label = newAlias;
        }
        !options.ignoreTickers && this.transferTickers(oldAlias, newAlias, "move");
    }

    /** Edit Tickers Methods */

    public get currentTickers() {
        return CanvasManagerStatic._currentTickers;
    }
    public get currentTickersSteps() {
        return CanvasManagerStatic._currentTickersSequence;
    }
    addTicker<TArgs extends TickerArgs>(canvasElementAlias: string | string[], ticker: TickerBase<TArgs>) {
        let tickerId: TickerIdType = ticker.id;
        if (typeof canvasElementAlias === "string") {
            canvasElementAlias = [canvasElementAlias];
        }
        if (!getTickerInstanceById<TArgs>(tickerId, ticker.args, ticker.duration, ticker.priority)) {
            logger.error(`Ticker ${tickerId} not found`);
            return;
        }
        let tickerHistory: TickerHistory<TArgs> = {
            fn: () => {},
            id: tickerId,
            args: createExportableElement(ticker.args),
            canvasElementAliases: canvasElementAlias,
            priority: ticker.priority,
            duration: ticker.duration,
            onEndOfTicker: () => {},
        };
        let id = CanvasManagerStatic.generateTickerId(tickerHistory);
        this.pushTicker(id, tickerHistory, ticker);
        this.pushEndOfTicker(id, tickerHistory, ticker);
        if (ticker.duration) {
            let timeout = setTimeout(() => {
                CanvasManagerStatic.removeTickerTimeoutInfo(timeout);
                let tickerTimeoutInfo = CanvasManagerStatic._currentTickersTimeouts[timeout.toString()];
                if (tickerTimeoutInfo) {
                    this.onEndOfTicker(id, {
                        aliasToRemoveAfter:
                            aliasToRemoveAfter in ticker.args ? (ticker.args.aliasToRemoveAfter as any) || [] : [],
                        tickerAliasToResume:
                            "tickerAliasToResume" in ticker.args ? (ticker.args.tickerAliasToResume as any) || [] : [],
                        ignoreTickerSteps: true,
                    });
                }
            }, ticker.duration * 1000);
            CanvasManagerStatic.addTickerTimeoutInfo(canvasElementAlias, tickerId, timeout.toString(), true);
        }
        return id;
    }
    private pushTicker<TArgs extends TickerArgs>(
        id: string,
        tickerData: TickerHistory<TArgs>,
        ticker: TickerBase<TArgs>
    ) {
        CanvasManagerStatic._currentTickers[id] = tickerData;
        tickerData.fn = (t: TickerValue) => {
            let data = CanvasManagerStatic._currentTickers[id];
            if (data) {
                let canvasElementAliases = data.canvasElementAliases;
                if (tickerData.createdByTicketSteps) {
                    if (
                        this.isTickerPaused(
                            tickerData.createdByTicketSteps.canvasElementAlias,
                            tickerData.createdByTicketSteps.id
                        )
                    ) {
                        return;
                    }
                } else {
                    canvasElementAliases = canvasElementAliases.filter((alias) => !this.isTickerPaused(alias, id));
                }
                ticker?.fn(t, data.args, canvasElementAliases, id);
            }
        };
        this.app.ticker.add(tickerData.fn, undefined, tickerData.priority);
    }
    private pushEndOfTicker<TArgs extends TickerArgs>(
        id: string,
        tickerData: TickerHistory<TArgs>,
        ticker: TickerBase<TArgs>
    ) {
        tickerData.onEndOfTicker = () => {
            ticker.onEndOfTicker(tickerData.canvasElementAliases, id, tickerData.args);
        };
    }
    /**
     * @deprecated use canvas.addTickersSequence
     */
    addTickersSteps(alias: string, steps: (Ticker<any> | RepeatType | PauseType)[], currentStepNumber = 0) {
        return this.addTickersSequence(alias, steps, currentStepNumber);
    }
    addTickersSequence(alias: string, steps: (Ticker<any> | RepeatType | PauseType)[], currentStepNumber = 0) {
        if (steps.length == 0) {
            logger.warn("The steps of the tickers is empty");
            return;
        }
        if (!(alias in CanvasManagerStatic._currentTickersSequence)) {
            CanvasManagerStatic._currentTickersSequence[alias] = {};
        }
        let step: TickersSequence = {
            currentStepNumber: currentStepNumber,
            steps: steps.map((step) => {
                if (step === Repeat) {
                    return step;
                }
                if (step.hasOwnProperty("type") && (step as PauseType).type === "pause") {
                    return step as PauseType;
                }
                let tickerId = (step as Ticker<any>).id;
                return {
                    ticker: tickerId,
                    args: createExportableElement((step as TickerBase<any>).args),
                    duration: step.duration,
                };
            }),
        };
        let key = CanvasManagerStatic.generateTickerId(step);
        CanvasManagerStatic._currentTickersSequence[alias][key] = step;
        this.runTickersSequence(alias, key);
        return key;
    }
    private runTickersSequence<TArgs extends TickerArgs>(alias: string, key: string) {
        if (
            !CanvasManagerStatic._currentTickersSequence[alias] ||
            !CanvasManagerStatic._currentTickersSequence[alias][key]
        ) {
            return;
        }
        let step =
            CanvasManagerStatic._currentTickersSequence[alias][key].steps[
                CanvasManagerStatic._currentTickersSequence[alias][key].currentStepNumber
            ];
        if (step === Repeat) {
            step = CanvasManagerStatic._currentTickersSequence[alias][key].steps[0];
            CanvasManagerStatic._currentTickersSequence[alias][key].currentStepNumber = 0;
            if (step === Repeat) {
                logger.error("TikersSteps has a RepeatType in the first step");
                return;
            }
        }
        if (step.hasOwnProperty("type") && (step as PauseType).type === "pause") {
            let timeout = setTimeout(() => {
                let tickerTimeoutInfo = CanvasManagerStatic._currentTickersTimeouts[timeout.toString()];
                if (tickerTimeoutInfo) {
                    tickerTimeoutInfo.aliases.forEach((alias) => {
                        this.nextTickerStep(alias, key);
                    });
                }
                CanvasManagerStatic.removeTickerTimeoutInfo(timeout);
            }, (step as PauseType).duration * 1000);
            CanvasManagerStatic.addTickerTimeoutInfo(alias, "steps", timeout.toString(), false);
            return;
        }
        let ticker = getTickerInstanceById<TArgs>(
            (step as TickersStep<TArgs>).ticker,
            (step as TickersStep<TArgs>).args,
            step.duration,
            (step as TickersStep<TArgs>).priority
        );
        if (!ticker) {
            logger.error(`Ticker ${(step as TickersStep<TArgs>).ticker} not found`);
            return;
        }
        let tickerName: TickerIdType = ticker.id;
        let tickerHistory: TickerHistory<TArgs> = {
            fn: () => {},
            id: tickerName,
            args: createExportableElement(ticker.args),
            canvasElementAliases: [alias],
            priority: ticker.priority,
            duration: ticker.duration,
            createdByTicketSteps: {
                canvasElementAlias: alias,
                id: key,
            },
            onEndOfTicker: () => {},
        };
        let id = CanvasManagerStatic.generateTickerId(tickerHistory);
        this.pushTicker(id, tickerHistory, ticker);
        if (ticker.duration) {
            let timeout = setTimeout(() => {
                let tickerTimeoutInfo = CanvasManagerStatic._currentTickersTimeouts[timeout.toString()];
                if (tickerTimeoutInfo) {
                    this.onEndOfTicker(id, {
                        aliasToRemoveAfter:
                            aliasToRemoveAfter in ticker.args ? (ticker.args.aliasToRemoveAfter as any) || [] : [],
                        tickerAliasToResume:
                            "tickerAliasToResume" in ticker.args ? (ticker.args.tickerAliasToResume as any) || [] : [],
                        ignoreTickerSteps: true,
                    });
                    tickerTimeoutInfo.aliases.forEach((alias) => {
                        this.nextTickerStep(alias, key);
                    });
                }
                CanvasManagerStatic.removeTickerTimeoutInfo(timeout);
            }, ticker.duration * 1000);
            CanvasManagerStatic.addTickerTimeoutInfo(alias, tickerName, timeout.toString(), false);
        }
    }
    private nextTickerStep(alias: string, key: string) {
        if (
            CanvasManagerStatic._currentTickersSequence[alias] &&
            CanvasManagerStatic._currentTickersSequence[alias][key]
        ) {
            let steps = CanvasManagerStatic._currentTickersSequence[alias][key];
            if (steps.currentStepNumber + 1 < steps.steps.length) {
                steps.currentStepNumber++;
                CanvasManagerStatic._currentTickersSequence[alias][key] = steps;
                this.runTickersSequence(alias, key);
            } else {
                if (
                    key &&
                    CanvasManagerStatic._currentTickersSequence[alias] &&
                    CanvasManagerStatic._currentTickersSequence[alias][key]
                ) {
                    delete CanvasManagerStatic._currentTickersSequence[alias][key];
                    Object.entries(CanvasManagerStatic._currentTickers).forEach(([id, ticker]) => {
                        if (ticker.createdByTicketSteps?.canvasElementAlias === alias) {
                            if (ticker.createdByTicketSteps.id === key) {
                                this.removeTicker(id);
                            }
                        }
                    });
                }
            }
        }
    }
    public onEndOfTicker(
        tickerId: string,
        options: {
            aliasToRemoveAfter: string[] | string;
            tickerAliasToResume: string[] | string;
            ignoreTickerSteps?: boolean;
        }
    ) {
        let tickerData = CanvasManagerStatic._currentTickers[tickerId];
        let ignoreTickerSteps = options.ignoreTickerSteps || false;
        this.remove(options.aliasToRemoveAfter);
        this.resumeTicker(options.tickerAliasToResume);
        if (tickerData) {
            this.removeTicker(tickerId);
            if (!ignoreTickerSteps && tickerData.duration == undefined && tickerData.createdByTicketSteps) {
                this.nextTickerStep(
                    tickerData.createdByTicketSteps.canvasElementAlias,
                    tickerData.createdByTicketSteps.id
                );
            }
        }
    }
    public unlinkComponentFromTicker(
        alias: string | string[],
        ticker?: typeof TickerBase<any> | TickerBase<any> | string
    ) {
        if (typeof alias === "string") {
            alias = [alias];
        }

        if (!ticker) {
            alias.forEach((alias) => {
                Object.entries(CanvasManagerStatic._currentTickers).forEach(([id, ticker]) => {
                    if (ticker.canvasElementAliases.includes(alias)) {
                        if (ticker.canvasElementAliases.length === 1) {
                            this.removeTicker(id);
                        } else {
                            ticker.canvasElementAliases = ticker.canvasElementAliases.filter((t) => t !== alias);
                        }
                    }
                });
                if (CanvasManagerStatic._currentTickersSequence[alias]) {
                    delete CanvasManagerStatic._currentTickersSequence[alias];
                }
                CanvasManagerStatic.removeTickerTimeoutsByAlias(alias, false);
            });
            return;
        }

        let tickerId: TickerIdType;
        if (typeof ticker === "string") {
            tickerId = ticker;
        } else if (ticker instanceof TickerBase) {
            tickerId = ticker.id;
        } else {
            tickerId = ticker.prototype.id;
        }
        alias.forEach((alias) => {
            if (CanvasManagerStatic._currentTickersSequence[alias]) {
                Object.entries(CanvasManagerStatic._currentTickersSequence[alias]).forEach(([id, ticker]) => {
                    if (ticker.steps.find((t) => typeof t === "object" && "ticker" in t && t.ticker === tickerId)) {
                        delete CanvasManagerStatic._currentTickersSequence[alias][id];
                    }
                });
            }
        });
        Object.entries(CanvasManagerStatic._currentTickers).forEach(([id, ticker]) => {
            if (ticker.id === tickerId) {
                CanvasManagerStatic._currentTickers[id].canvasElementAliases = ticker.canvasElementAliases.filter(
                    (e) => !alias.includes(e)
                );
            }
        });
        Object.entries(CanvasManagerStatic._currentTickersTimeouts).forEach(([timeout, tickerTimeout]) => {
            if (tickerTimeout.ticker === tickerId && tickerTimeout.canBeDeletedBeforeEnd) {
                CanvasManagerStatic._currentTickersTimeouts[timeout].aliases = tickerTimeout.aliases.filter(
                    (t) => !alias.includes(t)
                );
            }
        });
        this.removeTickersWithoutAssociatedCanvasElement();
    }
    /**
     * Remove all tickers that are not connected to any existing canvas element.
     */
    private removeTickersWithoutAssociatedCanvasElement() {
        Object.entries(CanvasManagerStatic._currentTickers).forEach(([id, ticker]) => {
            ticker.canvasElementAliases = ticker.canvasElementAliases.filter((e) => this.find(e));
            if (ticker.canvasElementAliases.length === 0) {
                this.onEndOfTicker(id, {
                    aliasToRemoveAfter: aliasToRemoveAfter in ticker.args ? ticker.args.aliasToRemoveAfter : [],
                    tickerAliasToResume: "tickerAliasToResume" in ticker.args ? ticker.args.tickerAliasToResume : [],
                    ignoreTickerSteps: true,
                });
            }
        });
        Object.entries(CanvasManagerStatic._currentTickersSequence).forEach(([alias, ticker]) => {
            if (ticker === undefined) {
                delete CanvasManagerStatic._currentTickersSequence[alias];
            }
        });
        Object.entries(CanvasManagerStatic._currentTickersTimeouts).forEach(([timeout, { aliases: aliases }]) => {
            if (aliases.length === 0) {
                CanvasManagerStatic.removeTickerTimeout(timeout);
            }
        });
    }
    public removeAllTickers() {
        CanvasManagerStatic._currentTickersSequence = {};
        Object.keys(CanvasManagerStatic._currentTickers).forEach((id) => {
            this.removeTicker(id);
        });
        CanvasManagerStatic._currentTickers = {};
        for (let timeout in CanvasManagerStatic._currentTickersTimeouts) {
            CanvasManagerStatic.removeTickerTimeout(timeout);
        }
        CanvasManagerStatic._tickersToCompleteOnStepEnd = { tikersIds: [], stepAlias: [] };
        CanvasManagerStatic._tickersOnPause = {};
    }
    removeTicker(tickerId: string | string[]) {
        if (typeof tickerId === "string") {
            tickerId = [tickerId];
        }
        tickerId.forEach((tickerId) => {
            let ticker = CanvasManagerStatic._currentTickers[tickerId];
            if (ticker) {
                if (ticker.args.hasOwnProperty(aliasToRemoveAfter)) {
                    let aliasToRemoveAfter: string | string[] = ticker.args.aliasToRemoveAfter;
                    this.remove(aliasToRemoveAfter);
                }
                this.app.ticker.remove(ticker.fn);
                delete CanvasManagerStatic._currentTickers[tickerId];
            }
        });
    }

    /**
     * @deprecated use canvas.pauseTicker
     */
    putOnPauseTicker(alias: string, options: PauseTickerType = {}) {
        this.pauseTicker(alias, options);
    }
    pauseTicker(alias: string, options: PauseTickerType = {}) {
        let oldOptions = CanvasManagerStatic._tickersOnPause[alias];
        if (!oldOptions) {
            CanvasManagerStatic._tickersOnPause[alias] = options;
            return;
        }
        if (options.tickerIdsExcluded) {
            if (oldOptions.tickerIdsExcluded) {
                CanvasManagerStatic._tickersOnPause[alias].tickerIdsExcluded = [
                    ...oldOptions.tickerIdsExcluded,
                    ...options.tickerIdsExcluded,
                ];
            } else {
                CanvasManagerStatic._tickersOnPause[alias].tickerIdsExcluded = options.tickerIdsExcluded;
            }
        }
        if (options.tickerIdsIncluded) {
            if (oldOptions.tickerIdsIncluded) {
                CanvasManagerStatic._tickersOnPause[alias].tickerIdsIncluded = [
                    ...oldOptions.tickerIdsIncluded,
                    ...options.tickerIdsIncluded,
                ];
            } else {
                CanvasManagerStatic._tickersOnPause[alias].tickerIdsIncluded = options.tickerIdsIncluded;
            }
        }
    }
    /**
     * @deprecated use canvas.resumeTicker
     */
    resumeTickerPaused(alias: string | string[]) {
        this.resumeTicker(alias);
    }
    resumeTicker(alias: string | string[]) {
        if (typeof alias === "string") {
            alias = [alias];
        }
        alias.forEach((alias) => {
            delete CanvasManagerStatic._tickersOnPause[alias];
        });
    }
    isTickerPaused(alias: string, tickerId?: string): boolean {
        let tickersOnPauseData = CanvasManagerStatic._tickersOnPause[alias];
        if (tickersOnPauseData) {
            if (tickerId) {
                if ("tickerIdsIncluded" in tickersOnPauseData && tickersOnPauseData.tickerIdsIncluded) {
                    return tickersOnPauseData.tickerIdsIncluded.includes(tickerId);
                }
                if ("tickerIdsExcluded" in tickersOnPauseData && tickersOnPauseData.tickerIdsExcluded) {
                    return !tickersOnPauseData.tickerIdsExcluded.includes(tickerId);
                }
            }
            return true;
        }
        return false;
    }
    completeTickerOnStepEnd(step: {
        /**
         * The id of the step.
         */
        id: string;
        /**
         * If is a sequence of tickers, the alias of the sequence of tickers.
         */
        alias?: string;
    }) {
        if (step.alias) {
            CanvasManagerStatic._tickersToCompleteOnStepEnd.stepAlias.push({ id: step.id, alias: step.alias });
        } else {
            CanvasManagerStatic._tickersToCompleteOnStepEnd.tikersIds.push({ id: step.id });
        }
    }

    forceCompletionOfTicker(id: string, alias?: string) {
        if (!alias) {
            let ticker = CanvasManagerStatic._currentTickers[id];
            if (ticker) {
                ticker.onEndOfTicker();
            }
        } else {
            let tickers = CanvasManagerStatic._currentTickersSequence[alias];
            if (tickers && tickers[id]) {
                if (tickers[id].steps.includes(Repeat)) {
                    logger.error(
                        `The ticker alias: ${alias} id: ${id} contains a RepeatType, so it can't be forced to complete`,
                        tickers[id]
                    );
                } else {
                    tickers[id].steps.forEach((step) => {
                        if (typeof step === "object" && "ticker" in step) {
                            let ticker = getTickerInstanceById<any>(
                                (step as TickersStep<any>).ticker,
                                (step as TickersStep<any>).args,
                                step.duration,
                                (step as TickersStep<any>).priority
                            );
                            if (ticker) {
                                ticker.onEndOfTicker([alias], id, (step as TickersStep<any>).args);
                            }
                        }
                    });
                }
            }
        }
    }

    /* Layers Methods */

    addLayer(label: string, layer: PixiContainer) {
        if (label === CANVAS_APP_GAME_LAYER_ALIAS) {
            logger.error(`The alias ${CANVAS_APP_GAME_LAYER_ALIAS} is reserved`);
            return;
        }
        layer.label = label;
        return CanvasManagerStatic.app.stage.addChild(layer);
    }

    getLayer(label: string) {
        return CanvasManagerStatic.app.stage.getChildByLabel(label);
    }

    removeLayer(label: string) {
        CanvasManagerStatic.app.stage.getChildrenByLabel(label);
    }

    /* Other Methods */

    async extractImage() {
        const image = await this.app.renderer.extract.image(this.gameLayer);
        return image.src;
    }

    clear() {
        this.removeAll();
    }

    /* Export and Import Methods */

    public export(): CanvasGamState {
        let currentElements: { [alias: string]: CanvasBaseItemMemory } = {};
        this.children.forEach((child) => {
            if (child.label) {
                currentElements[child.label] = exportCanvasElement(child);
            }
        });
        return {
            tickers: createExportableElement(CanvasManagerStatic.currentTickersWithoutCreatedBySteps),
            tickersSteps: createExportableElement(CanvasManagerStatic._currentTickersSequence),
            elements: createExportableElement(currentElements),
            stage: createExportableElement(getMemoryContainer(this.gameLayer)),
            elementAliasesOrder: createExportableElement(CanvasManagerStatic.childrenAliasesOrder),
            tickersOnPause: createExportableElement(CanvasManagerStatic._tickersOnPause),
            tickersToCompleteOnStepEnd: createExportableElement(CanvasManagerStatic._tickersToCompleteOnStepEnd),
        };
    }
    public async restore(data: object) {
        try {
            let tickersToTrasfer: { [oldId: string]: string } = {};
            if (data.hasOwnProperty("elementAliasesOrder") && data.hasOwnProperty("elements")) {
                let currentElements = (data as CanvasGamState)["elements"];
                let elementAliasesOrder = (data as CanvasGamState)["elementAliasesOrder"];
                let promises = elementAliasesOrder
                    .filter((alias) => currentElements[alias])
                    .map((alias) => importCanvasElement(currentElements[alias]));
                let list = await Promise.all(promises);
                this.clear();
                list.forEach((element, i) => {
                    let alias = elementAliasesOrder[i];
                    this.add(alias, element);
                    CanvasManagerStatic.childrenAliasesOrder.push(alias);
                });
            } else {
                logger.error("The data does not have the properties elementAliasesOrder and elements");
                return;
            }
            if (data.hasOwnProperty("stage") && data.hasOwnProperty("stage")) {
                setMemoryContainer(this.gameLayer, (data as CanvasGamState)["stage"], { ignoreScale: true });
            } else {
                logger.error("The data does not have the properties stage");
            }
            if (data.hasOwnProperty("tickers")) {
                let tickers = (data as CanvasGamState)["tickers"];
                Object.entries(tickers).forEach(([oldId, t]) => {
                    let aliases: string[] = t.canvasElementAliases;
                    let ticker = getTickerInstanceById(t.id, t.args, t.duration, t.priority);
                    if (ticker) {
                        let id = this.addTicker(aliases, ticker);
                        if (id) {
                            tickersToTrasfer[oldId] = id;
                        }
                    } else {
                        logger.error(`Ticker ${t.id} not found`);
                    }
                });
            }
            if (data.hasOwnProperty("tickersSteps")) {
                let tickersSteps = (data as CanvasGamState)["tickersSteps"];
                Object.entries(tickersSteps).forEach(([alias, steps]) => {
                    CanvasManagerStatic._currentTickersSequence[alias] = steps;
                    Object.keys(steps).forEach((key) => {
                        this.runTickersSequence(alias, key);
                    });
                });
            }
            if (data.hasOwnProperty("tickersOnPause")) {
                let tickersOnPause = (data as CanvasGamState)["tickersOnPause"];
                Object.keys(tickersOnPause).forEach((alias) => {
                    let data = tickersOnPause[alias];
                    if ("tickerIdsExcluded" in data && data.tickerIdsExcluded) {
                        tickersOnPause[alias].tickerIdsExcluded = data.tickerIdsExcluded.map(
                            (id: string) => tickersToTrasfer[id] || id
                        );
                    }
                    if ("tickerIdsIncluded" in data && data.tickerIdsIncluded) {
                        tickersOnPause[alias].tickerIdsIncluded = data.tickerIdsIncluded.map(
                            (id: string) => tickersToTrasfer[id] || id
                        );
                    }
                });
                CanvasManagerStatic._tickersOnPause = tickersOnPause;
            }
            if (data.hasOwnProperty("tickersToCompleteOnStepEnd")) {
                let tickersToCompleteOnStepEnd = (data as CanvasGamState)["tickersToCompleteOnStepEnd"];
                let tikersIds = tickersToCompleteOnStepEnd.tikersIds.map((t) => ({
                    id: tickersToTrasfer[t.id] || t.id,
                }));
                let stepAlias = tickersToCompleteOnStepEnd.stepAlias.map((t) => ({ id: t.id, alias: t.alias }));
                CanvasManagerStatic._tickersToCompleteOnStepEnd = { tikersIds, stepAlias };
            }
        } catch (e) {
            logger.error("Error importing data", e);
        }
    }
}
