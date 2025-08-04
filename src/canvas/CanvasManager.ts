import { Devtools } from "@pixi/devtools";
import { ApplicationOptions, Container as PixiContainer, UPDATE_PRIORITY } from "pixi.js";
import { CANVAS_APP_GAME_LAYER_ALIAS, Repeat } from "../constants";
import { createExportableElement } from "../utils/export-utility";
import { logger } from "../utils/log-utility";
import CanvasManagerStatic from "./CanvasManagerStatic";
import { setMemoryContainer } from "./components/Container";
import ImageContainer, { setMemoryImageContainer } from "./components/ImageContainer";
import ImageSprite, { setMemoryImageSprite } from "./components/ImageSprite";
import Sprite, { setMemorySprite } from "./components/Sprite";
import Text, { setMemoryText } from "./components/Text";
import VideoSprite, { setMemoryVideoSprite } from "./components/VideoSprite";
import { importCanvasElement } from "./functions/canvas-import-utility";
import { exportCanvasElement, getMemoryContainer } from "./functions/canvas-memory-utility";
import { CanvasBaseInterface } from "./interfaces/CanvasBaseInterface";
import CanvasGameState from "./interfaces/CanvasGameState";
import CanvasManagerInterface from "./interfaces/CanvasManagerInterface";
import CanvasBaseItemMemory from "./interfaces/memory/CanvasBaseItemMemory";
import { Ticker, TickerArgs, TickerInfo } from "./tickers";
import MotionTicker from "./tickers/components/MotionTicker";
import RegisteredTickers from "./tickers/decorators/RegisteredTickers";
import TickersSequence, { TickersStep } from "./tickers/interfaces/TickersSequence";
import { aliasToRemoveAfter } from "./tickers/types/AliasToRemoveAfterType";
import AnimationOptions, { KeyframesType } from "./types/AnimationOptions";
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
    /**
     * @deprecated Use `canvas.getHtmlLayers` instead.
     */
    get htmlLayout(): HTMLElement | undefined {
        return CanvasManagerStatic.htmlLayers[0];
    }
    /**
     * @deprecated Use `canvas.addHtmlLayer` instead.
     */
    set htmlLayout(value: HTMLElement) {
        this.addHtmlLayer("ui", value);
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

    public async init(
        element: HTMLElement,
        widthOrOptions: (Partial<ApplicationOptions> & { width: number; height: number }) | number,
        heightOrDevtoolsOptions?: Devtools | number,
        options?: Partial<ApplicationOptions>,
        devtoolsOptions?: Devtools
    ): Promise<void> {
        if (typeof widthOrOptions === "number" && typeof heightOrDevtoolsOptions === "number") {
            return await CanvasManagerStatic.init(
                element,
                widthOrOptions,
                heightOrDevtoolsOptions,
                options,
                devtoolsOptions
            );
        } else if (typeof widthOrOptions !== "number" && typeof heightOrDevtoolsOptions !== "number") {
            return await CanvasManagerStatic.init(
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

    /**
     * @deprecated Use `canvas.addHtmlLayer` instead.
     */
    public initializeHTMLLayout(element: HTMLElement) {
        this.addHtmlLayer("ui", element);
    }

    /* Edit Canvas Elements Methods */

    get children() {
        return CanvasManagerStatic.gameLayer.children;
    }
    async copyCanvasElementProperty<T extends CanvasBaseItemMemory>(
        oldAlias: T | CanvasBaseInterface<T> | string,
        newAlias: CanvasBaseInterface<T> | string
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
        Object.entries(CanvasManagerStatic._currentTickers).forEach(([id, info]) => {
            if (info.createdByTicketSteps?.canvasElementAlias === oldAlias) {
                this.removeTicker(id);
            }
            if (info.ticker.canvasElementAliases.includes(oldAlias)) {
                let ticker = RegisteredTickers.getInstance(
                    info.ticker.id,
                    createExportableElement(info.ticker.args),
                    info.ticker.duration,
                    info.ticker.priority
                );
                if (ticker) {
                    ticker.canvasElementAliases = [newAlias];
                    this.addTicker(newAlias, ticker);
                    if (info.ticker.paused) {
                        ticker.pause();
                    }
                } else {
                    logger.error(`Ticker ${info.ticker.id} not found`);
                }

                if (mode === "move") {
                    info.ticker.canvasElementAliases = info.ticker.canvasElementAliases.filter(
                        (alias) => alias !== oldAlias
                    );
                }

                if (info.ticker.args.hasOwnProperty(aliasToRemoveAfter)) {
                    let aliasToRemoveAfter: string | string[] = info.ticker.args.aliasToRemoveAfter;
                    if (typeof aliasToRemoveAfter === "string") {
                        aliasToRemoveAfter = [aliasToRemoveAfter];
                    }
                    if (Array.isArray(aliasToRemoveAfter)) {
                        if (mode === "move") {
                            info.ticker.args.aliasToRemoveAfter = aliasToRemoveAfter.map((t) =>
                                t === oldAlias ? newAlias : t
                            );
                        } else if (mode === "duplicate") {
                            if (aliasToRemoveAfter.find((t) => t === oldAlias)) {
                                info.ticker.args.aliasToRemoveAfter = [...aliasToRemoveAfter, newAlias];
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
        canvasComponent: CanvasBaseInterface<any>,
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
    public find<T extends CanvasBaseInterface<any>>(alias: string): T | undefined {
        if (alias === CANVAS_APP_GAME_LAYER_ALIAS) {
            return this.gameLayer as T;
        }
        let canvasComponent = this.gameLayer.getChildByLabel(alias);
        if (canvasComponent) {
            return canvasComponent as T;
        }
        return undefined;
    }
    public canvasElementIsOnCanvas<T extends PixiContainer>(pixiElement: T) {
        return this.gameLayer.children.includes(pixiElement);
    }
    public removeAll() {
        this.gameLayer.removeChildren();
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
    addTicker<TArgs extends TickerArgs>(
        canvasElementAlias: string | string[],
        ticker: Ticker<TArgs>,
        options?: {
            /**
             * The id of the ticker.
             */
            id?: string;
        }
    ) {
        let tickerId: TickerIdType = ticker.id;
        if (typeof canvasElementAlias === "string") {
            canvasElementAlias = [canvasElementAlias];
        }
        ticker.canvasElementAliases = canvasElementAlias;
        if (!RegisteredTickers.has(tickerId)) {
            logger.error(`Ticker ${tickerId} not found`);
            return;
        }
        let tickerHistory: TickerInfo<TArgs> = {
            ticker: ticker,
        };
        const { id = CanvasManagerStatic.generateTickerId(tickerHistory) } = options || {};
        CanvasManagerStatic._currentTickers[id] = tickerHistory;
        tickerHistory.ticker.start(id);
        if (ticker.duration) {
            let timeout = setTimeout(() => {
                CanvasManagerStatic.removeTickerTimeoutInfo(timeout);
                let tickerTimeoutInfo = CanvasManagerStatic._currentTickersTimeouts[timeout.toString()];
                if (tickerTimeoutInfo) {
                    this.onTickerComplete(id, {
                        aliasToRemoveAfter:
                            aliasToRemoveAfter in ticker.args ? (ticker.args.aliasToRemoveAfter as any) || [] : [],
                        tickerAliasToResume:
                            "tickerAliasToResume" in ticker.args ? (ticker.args.tickerAliasToResume as any) || [] : [],
                        tickerIdToResume:
                            "tickerIdToResume" in ticker.args ? (ticker.args.tickerIdToResume as any) || [] : [],
                        ignoreTickerSteps: true,
                    });
                }
            }, ticker.duration * 1000);
            CanvasManagerStatic.addTickerTimeoutInfo(canvasElementAlias, tickerId, timeout.toString(), true);
        }
        return id;
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
                    args: createExportableElement((step as Ticker<any>).args),
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
        let ticker = RegisteredTickers.getInstance<TArgs>(
            (step as TickersStep<TArgs>).ticker,
            (step as TickersStep<TArgs>).args,
            step.duration,
            (step as TickersStep<TArgs>).priority
        );
        if (!ticker) {
            logger.error(`Ticker ${(step as TickersStep<TArgs>).ticker} not found`);
            return;
        }
        ticker.canvasElementAliases = [alias];
        let tickerName: TickerIdType = ticker.id;
        let tickerHistory: TickerInfo<TArgs> = {
            createdByTicketSteps: {
                canvasElementAlias: alias,
                id: key,
            },
            ticker: ticker,
        };
        let id = CanvasManagerStatic.generateTickerId(tickerHistory);
        CanvasManagerStatic._currentTickers[id] = tickerHistory;
        tickerHistory.ticker.start(id);
        if (ticker.duration) {
            let timeout = setTimeout(() => {
                let tickerTimeoutInfo = CanvasManagerStatic._currentTickersTimeouts[timeout.toString()];
                if (tickerTimeoutInfo) {
                    this.onTickerComplete(id, {
                        aliasToRemoveAfter:
                            aliasToRemoveAfter in ticker.args ? (ticker.args.aliasToRemoveAfter as any) || [] : [],
                        tickerAliasToResume:
                            "tickerAliasToResume" in ticker.args ? (ticker.args.tickerAliasToResume as any) || [] : [],
                        tickerIdToResume:
                            "tickerIdToResume" in ticker.args ? (ticker.args.tickerIdToResume as any) || [] : [],
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
            aliasToRemoveAfter: string[];
            tickerAliasToResume: string[];
            tickerIdToResume: string[];
            ignoreTickerSteps?: boolean;
        }
    ) {
        return this.onTickerComplete(tickerId, options);
    }
    public onTickerComplete(
        tickerId: string,
        options: {
            aliasToRemoveAfter: string[];
            tickerAliasToResume: string[];
            tickerIdToResume: string[];
            ignoreTickerSteps?: boolean;
            stopTicker?: boolean;
        }
    ) {
        const { stopTicker = true, aliasToRemoveAfter, tickerAliasToResume, tickerIdToResume } = options;
        let info = CanvasManagerStatic._currentTickers[tickerId];
        let ignoreTickerSteps = options.ignoreTickerSteps || false;
        this.remove(aliasToRemoveAfter);
        tickerAliasToResume.forEach((alias) => this.resumeTicker({ canvasAlias: alias }));
        this.resumeTicker({ id: tickerIdToResume });
        if (info) {
            this.removeTicker(tickerId, {
                stopTicker: stopTicker,
            });
            if (!ignoreTickerSteps && info.ticker.duration == undefined && info.createdByTicketSteps) {
                this.nextTickerStep(info.createdByTicketSteps.canvasElementAlias, info.createdByTicketSteps.id);
            }
        }
    }
    public unlinkComponentFromTicker(
        alias: string | string[],
        ticker?: { new (args: any, duration?: number, priority?: UPDATE_PRIORITY): Ticker<any> } | string
    ) {
        if (typeof alias === "string") {
            alias = [alias];
        }

        if (!ticker) {
            alias.forEach((alias) => {
                Object.entries(CanvasManagerStatic._currentTickers).forEach(([id, info]) => {
                    if (info.ticker.canvasElementAliases.includes(alias)) {
                        if (info.ticker.canvasElementAliases.length === 1) {
                            this.removeTicker(id);
                        } else {
                            info.ticker.canvasElementAliases = info.ticker.canvasElementAliases.filter(
                                (t) => t !== alias
                            );
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
        Object.entries(CanvasManagerStatic._currentTickers).forEach(([id, info]) => {
            if (info.ticker.id === tickerId) {
                CanvasManagerStatic._currentTickers[id].ticker.canvasElementAliases =
                    info.ticker.canvasElementAliases.filter((e) => !alias.includes(e));
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
        Object.entries(CanvasManagerStatic._currentTickers).forEach(([id, info]) => {
            info.ticker.canvasElementAliases = info.ticker.canvasElementAliases.filter((e) => this.find(e));
            if (info.ticker.canvasElementAliases.length === 0) {
                this.onTickerComplete(id, {
                    aliasToRemoveAfter:
                        aliasToRemoveAfter in info.ticker.args ? info.ticker.args.aliasToRemoveAfter : [],
                    tickerAliasToResume:
                        "tickerAliasToResume" in info.ticker.args ? info.ticker.args.tickerAliasToResume : [],
                    tickerIdToResume: "tickerIdToResume" in info.ticker.args ? info.ticker.args.tickerIdToResume : [],
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
    removeTicker(
        tickerId: string | string[],
        options: {
            stopTicker?: boolean;
        } = { stopTicker: true }
    ) {
        if (typeof tickerId === "string") {
            tickerId = [tickerId];
        }
        tickerId.forEach((tickerId) => {
            let info = CanvasManagerStatic._currentTickers[tickerId];
            if (info) {
                if (info.ticker.args.hasOwnProperty(aliasToRemoveAfter)) {
                    let aliasToRemoveAfter: string | string[] = info.ticker.args.aliasToRemoveAfter;
                    this.remove(aliasToRemoveAfter);
                }
                options.stopTicker && info.ticker.stop();
                delete CanvasManagerStatic._currentTickers[tickerId];
            }
        });
    }

    pauseTicker(
        filters:
            | {
                  canvasAlias: string;
                  tickerIdsExcluded?: string[];
              }
            | {
                  id: string | string[];
              }
    ) {
        let ids: string[] = [];
        if ("canvasAlias" in filters) {
            const { canvasAlias, tickerIdsExcluded = [] } = filters;
            Object.entries(CanvasManagerStatic._currentTickers).forEach(([id, info]) => {
                if (
                    info.ticker.canvasElementAliases.includes(canvasAlias) &&
                    !tickerIdsExcluded.includes(info.ticker.id) &&
                    info.ticker.paused === false
                ) {
                    info.ticker.pause();
                    ids.push(id);
                }
            });
        } else if ("id" in filters) {
            let { id } = filters;
            if (typeof id === "string") {
                id = [id];
            }
            id.forEach((id) => {
                let info = CanvasManagerStatic._currentTickers[id];
                if (info) {
                    if (info.ticker.paused === false) {
                        info.ticker.pause();
                        ids.push(id);
                    }
                } else {
                    logger.error(`Ticker with id ${id} not found`);
                }
            });
        }
        return ids;
    }
    resumeTicker(
        filters:
            | {
                  canvasAlias: string;
              }
            | {
                  id: string | string[];
              }
    ) {
        if ("canvasAlias" in filters) {
            const { canvasAlias } = filters;
            Object.values(CanvasManagerStatic._currentTickers).forEach((info) => {
                if (info.ticker.canvasElementAliases.includes(canvasAlias)) {
                    info.ticker.play();
                }
            });
            // TODO: to remove in the future
            delete CanvasManagerStatic._tickersOnPause[canvasAlias];
        } else if ("id" in filters) {
            let { id } = filters;
            if (typeof id === "string") {
                id = [id];
            }
            id.forEach((id) => {
                let info = CanvasManagerStatic._currentTickers[id];
                if (info) {
                    info.ticker.play();
                } else {
                    logger.error(`Ticker with id ${id} not found`);
                }
            });
        }
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

    async forceCompletionOfTicker(id: string, alias?: string) {
        if (!alias) {
            let info = CanvasManagerStatic._currentTickers[id];
            if (info) {
                await info.ticker.complete();
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
                    const promises = tickers[id].steps.map((step) => {
                        if (typeof step === "object" && "ticker" in step) {
                            let ticker = RegisteredTickers.getInstance<any>(
                                (step as TickersStep<any>).ticker,
                                (step as TickersStep<any>).args,
                                step.duration,
                                (step as TickersStep<any>).priority
                            );
                            if (ticker) {
                                ticker.canvasElementAliases = [alias];
                                return ticker.complete();
                            }
                        }
                    });
                    await Promise.all(promises);
                }
            }
        }
    }

    animate<T extends CanvasBaseInterface<any>>(
        components: T | string | (string | T)[],
        keyframes: KeyframesType<T> = {},
        options: AnimationOptions,
        priority?: UPDATE_PRIORITY
    ) {
        try {
            keyframes = createExportableElement(keyframes);
        } catch (e) {
            logger.error("animate keyframes cannot contain functions or classes");
            throw e;
        }
        try {
            options = createExportableElement(options);
        } catch (e) {
            logger.error("animate options cannot contain functions or classes");
            throw e;
        }
        let aliases: string[] = [];
        if (typeof components === "string") {
            aliases = [components];
        } else if (Array.isArray(components)) {
            aliases = components.map((c) => (typeof c === "string" ? c : c.label));
        } else {
            aliases = [components.label];
        }
        const ticker = new MotionTicker(
            {
                keyframes: keyframes,
                options: options,
            },
            undefined,
            priority
        );
        return this.addTicker(aliases, ticker);
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

    addHtmlLayer(id: string, element: HTMLElement, style?: Pick<CSSStyleDeclaration, "position" | "pointerEvents">) {
        return CanvasManagerStatic.addHtmlLayer(id, element, style);
    }
    removeHtmlLayer(id: string) {
        return CanvasManagerStatic.removeHtmlLayer(id);
    }
    getHtmlLayer(id: string): HTMLElement | undefined {
        return CanvasManagerStatic.getHtmlLayer(id);
    }

    /* Other Methods */

    async extractImage() {
        const image = await this.app.renderer.extract.image(this.gameLayer);
        return image.src;
    }

    clear() {
        this.removeAllTickers();
        this.removeAll();
    }

    /* Export and Import Methods */

    public export(): CanvasGameState {
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
        this.clear();
        try {
            if (data.hasOwnProperty("elementAliasesOrder") && data.hasOwnProperty("elements")) {
                let elementAliasesOrder = (data as CanvasGameState)["elementAliasesOrder"];
                let elements: {
                    [alias: string]: CanvasBaseInterface<any>;
                } = {};
                const promises = Object.entries((data as CanvasGameState)["elements"]).map(async ([alias, element]) => {
                    elements[alias] = await importCanvasElement(element);
                });
                await Promise.all(promises);
                elementAliasesOrder.forEach((alias) => {
                    let element = elements[alias];
                    element && this.add(alias, element);
                });
            } else {
                logger.error("The data does not have the properties elementAliasesOrder and elements");
                return;
            }
            if (data.hasOwnProperty("stage") && data.hasOwnProperty("stage")) {
                setMemoryContainer(this.gameLayer, (data as CanvasGameState)["stage"], { ignoreScale: true });
            } else {
                logger.error("The data does not have the properties stage");
            }
            if (data.hasOwnProperty("tickers")) {
                let tickers = (data as CanvasGameState)["tickers"];
                Object.entries(tickers).forEach(([oldId, t]) => {
                    let aliases: string[] = t.canvasElementAliases;
                    if (aliases.length !== 0) {
                        let ticker = RegisteredTickers.getInstance(t.id, t.args, t.duration, t.priority);
                        if (ticker) {
                            ticker.canvasElementAliases = aliases;
                            this.addTicker(aliases, ticker, {
                                id: oldId,
                            });
                            // TODO: it should be paused even before starting
                            // TODO: All tickets should be started at the same time and not wait for the previous one to initialize.
                            if (t.paused) {
                                ticker.pause();
                            }
                        } else {
                            logger.error(`Ticker ${t.id} not found`);
                        }
                    }
                });
            }
            if (data.hasOwnProperty("tickersSteps")) {
                let tickersSteps = (data as CanvasGameState)["tickersSteps"];
                Object.entries(tickersSteps).forEach(([alias, steps]) => {
                    CanvasManagerStatic._currentTickersSequence[alias] = steps;
                    Object.keys(steps).forEach((key) => {
                        this.runTickersSequence(alias, key);
                    });
                });
            }
            if (data.hasOwnProperty("tickersOnPause")) {
                let tickersOnPause = (data as CanvasGameState)["tickersOnPause"];
                Object.keys(tickersOnPause).forEach((alias) => {
                    let data = tickersOnPause[alias];
                    if ("tickerIdsExcluded" in data && data.tickerIdsExcluded) {
                        tickersOnPause[alias].tickerIdsExcluded = data.tickerIdsExcluded;
                    }
                    if ("tickerIdsIncluded" in data && data.tickerIdsIncluded) {
                        tickersOnPause[alias].tickerIdsIncluded = data.tickerIdsIncluded;
                    }
                });
                CanvasManagerStatic._tickersOnPause = tickersOnPause;
            }
            if (data.hasOwnProperty("tickersToCompleteOnStepEnd")) {
                let tickersToCompleteOnStepEnd = (data as CanvasGameState)["tickersToCompleteOnStepEnd"];
                let tikersIds = tickersToCompleteOnStepEnd.tikersIds;
                let stepAlias = tickersToCompleteOnStepEnd.stepAlias.map((t) => ({ id: t.id, alias: t.alias }));
                CanvasManagerStatic._tickersToCompleteOnStepEnd = { tikersIds, stepAlias };
            }
        } catch (e) {
            logger.error("Error importing data", e);
        }
    }
}
