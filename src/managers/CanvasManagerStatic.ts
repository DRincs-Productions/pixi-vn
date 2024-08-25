import sha1 from 'crypto-js/sha1';
import { Application } from "pixi.js";
import CanvasBase from "../classes/canvas/CanvasBase";
import { ITickersSteps, TickerHistory, TickerTimeoutHistory } from "../interface";

/**
 * This class is responsible for managing the canvas, the tickers, the events, and the window size and the children of the window.
 */
export default class CanvasManagerStatic {
    private constructor() { }

    static _app: Application | undefined = undefined
    static _isInitialized: boolean = false

    /* Resize Metods */

    /* Edit Canvas Elements Methods */

    static _children: { [alias: string]: CanvasBase<any> } = {}
    /**
     * The order of the children aliases.
     */
    static elementAliasesOrder: string[] = []

    /** Edit Tickers Methods */

    static get currentTickersWithoutCreatedBySteps() {
        return Object.fromEntries(Object.entries(CanvasManagerStatic._currentTickers).filter(([_, ticker]) => !ticker.createdByTicketStepsId))
    }
    static _currentTickers: { [id: string]: TickerHistory<any> } = {}
    static _currentTickersSteps: { [alias: string]: ITickersSteps } = {}
    static _currentTickersTimeouts: { [timeout: string]: TickerTimeoutHistory } = {}
    static generateTickerId(tickerData: TickerHistory<any>): string {
        try {
            return sha1(JSON.stringify(tickerData)).toString() + "_" + Math.random().toString(36).substring(7)
        }
        catch (e) {
            throw new Error(`[Pixi'VN] Error to generate ticker id: ${e}`)
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
    static removeTickerTimeoutsByAlias(alias: string, checkCanBeDeletedBeforeEnd: boolean) {
        for (let timeout in CanvasManagerStatic._currentTickersTimeouts) {
            let aliasesWithoutAliasToRemove = CanvasManagerStatic._currentTickersTimeouts[timeout].aliases.filter((t) => t !== alias)
            if (aliasesWithoutAliasToRemove.length === 0) {
                let canBeDeletedBeforeEnd = CanvasManagerStatic._currentTickersTimeouts[timeout].canBeDeletedBeforeEnd
                if (!checkCanBeDeletedBeforeEnd || canBeDeletedBeforeEnd) {
                    CanvasManagerStatic.removeTickerTimeout(timeout)
                }
            }
            else {
                CanvasManagerStatic._currentTickersTimeouts[timeout].aliases = aliasesWithoutAliasToRemove
            }
        }
    }
}
