import { PixiError } from "@drincs/pixi-vn/core";
import type { TickerHistory, TickerInfo, TickersSequence, TickerTimeoutHistory } from "./index";
import sha1 from "crypto-js/sha1";

/**
 * Static, module-scoped ticker bookkeeping - moved out of `CanvasManagerStatic` (formerly
 * `CanvasManagerStatic`'s "Edit Tickers Methods" section) so the `tickers` module can own its own
 * state without importing `@drincs/pixi-vn/canvas`.
 */
export default class TickersManagerStatic {
    private constructor() {}

    static get currentTickersWithoutCreatedBySteps(): {
        [k: string]: TickerHistory<any>;
    } {
        return Object.fromEntries(
            Array.from(TickersManagerStatic._currentTickers.entries())
                .filter(([_, info]) => !info.createdByTicketSteps)
                .map(([id, info]) => [
                    id,
                    {
                        id: info.ticker.alias,
                        args: info.ticker.args,
                        canvasElementAliases: info.ticker.canvasElementAliases,
                        priority: info.ticker.priority,
                        duration: info.ticker.duration,
                        paused: info.ticker.paused,
                    },
                ]),
        );
    }
    static readonly _currentTickers: Map<string, TickerInfo<any>> = new Map();
    static readonly _currentTickersSequence: Map<string, Map<string, TickersSequence>> = new Map();
    static get currentTickersSequence(): {
        [alias: string]: { [tickerId: string]: TickersSequence };
    } {
        return Object.fromEntries(
            Array.from(TickersManagerStatic._currentTickersSequence.entries()).map(
                ([alias, stepsMap]) => [alias, Object.fromEntries(stepsMap)],
            ),
        );
    }
    static readonly _currentTickersTimeouts: Map<string, TickerTimeoutHistory> = new Map();
    static readonly _tickersToCompleteOnStepEnd: {
        tikersIds: { id: string }[];
        stepAlias: { id: string; alias: string }[];
    } = { tikersIds: [], stepAlias: [] };
    static generateTickerId(...args: any[]): string {
        try {
            return `${sha1(JSON.stringify(args)).toString()}_${Math.random().toString(36).substring(7)}`;
        } catch (e) {
            throw new PixiError("not_json_serializable", `Error to generate ticker id: ${e}`);
        }
    }
    static addTickerTimeoutInfo(
        aliases: string | string[],
        ticker: string,
        timeout: string,
        canBeDeletedBeforeEnd: boolean,
    ) {
        if (typeof aliases === "string") {
            aliases = [aliases];
        }
        TickersManagerStatic._currentTickersTimeouts.set(timeout, {
            aliases: aliases,
            ticker: ticker,
            canBeDeletedBeforeEnd: canBeDeletedBeforeEnd,
        });
    }
    static removeTickerTimeoutInfo(timeout: NodeJS.Timeout | string) {
        if (typeof timeout !== "string") {
            timeout = timeout.toString();
        }
        TickersManagerStatic._currentTickersTimeouts.delete(timeout);
    }
    static removeTickerTimeout(timeout: NodeJS.Timeout | string) {
        if (typeof timeout !== "string") {
            timeout = timeout.toString();
        }
        clearTimeout(Number(timeout));
        TickersManagerStatic.removeTickerTimeoutInfo(timeout);
    }
    static removeTickerTimeoutsByAlias(alias: string, checkCanBeDeletedBeforeEnd: boolean) {
        TickersManagerStatic._currentTickersTimeouts.forEach((tickerTimeout, timeout) => {
            const aliasesWithoutAliasToRemove = tickerTimeout.aliases.filter((t) => t !== alias);
            if (aliasesWithoutAliasToRemove.length === 0) {
                const canBeDeletedBeforeEnd = tickerTimeout.canBeDeletedBeforeEnd;
                if (!checkCanBeDeletedBeforeEnd || canBeDeletedBeforeEnd) {
                    TickersManagerStatic.removeTickerTimeout(timeout);
                }
            } else {
                tickerTimeout.aliases = aliasesWithoutAliasToRemove;
            }
        });
    }
}
