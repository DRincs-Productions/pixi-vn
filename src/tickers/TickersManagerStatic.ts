import { PixiError } from "@drincs/pixi-vn/core";
import sha1 from "crypto-js/sha1";
import type { TickerHistory, default as TickerInfo } from "@tickers/interfaces/TickerInfo";
import type TickersSequence from "@tickers/interfaces/TickersSequence";
import type TickerTimeoutHistory from "@tickers/interfaces/TickerTimeoutHistory";

/**
 * Static, module-scoped ticker bookkeeping - moved out of `CanvasManagerStatic` (formerly
 * `CanvasManagerStatic`'s "Edit Tickers Methods" section) so the `tickers` module can own its own
 * state without importing `@drincs/pixi-vn/canvas`.
 */
export namespace TickersManagerStatic {
    export function currentTickersWithoutCreatedBySteps(): {
        [k: string]: TickerHistory<any>;
    } {
        return Object.fromEntries(
            Array.from(_currentTickers.entries())
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
    export const _currentTickers: Map<string, TickerInfo<any>> = new Map();
    export const _currentTickersSequence: Map<string, Map<string, TickersSequence>> = new Map();
    export function currentTickersSequence(): {
        [alias: string]: { [tickerId: string]: TickersSequence };
    } {
        return Object.fromEntries(
            Array.from(_currentTickersSequence.entries()).map(([alias, stepsMap]) => [
                alias,
                Object.fromEntries(stepsMap),
            ]),
        );
    }
    export const _currentTickersTimeouts: Map<string, TickerTimeoutHistory> = new Map();
    export const _tickersToCompleteOnStepEnd: {
        tikersIds: { id: string }[];
        stepAlias: { id: string; alias: string }[];
    } = { tikersIds: [], stepAlias: [] };
    export function generateTickerId(...args: any[]): string {
        try {
            return `${sha1(JSON.stringify(args)).toString()}_${Math.random().toString(36).substring(7)}`;
        } catch (e) {
            throw new PixiError("not_json_serializable", `Error to generate ticker id: ${e}`);
        }
    }
    export function addTickerTimeoutInfo(
        aliases: string | string[],
        ticker: string,
        timeout: string,
        canBeDeletedBeforeEnd: boolean,
    ) {
        if (typeof aliases === "string") {
            aliases = [aliases];
        }
        _currentTickersTimeouts.set(timeout, {
            aliases: aliases,
            ticker: ticker,
            canBeDeletedBeforeEnd: canBeDeletedBeforeEnd,
        });
    }
    export function removeTickerTimeoutInfo(timeout: NodeJS.Timeout | string) {
        if (typeof timeout !== "string") {
            timeout = timeout.toString();
        }
        _currentTickersTimeouts.delete(timeout);
    }
    export function removeTickerTimeout(timeout: NodeJS.Timeout | string) {
        if (typeof timeout !== "string") {
            timeout = timeout.toString();
        }
        clearTimeout(Number(timeout));
        removeTickerTimeoutInfo(timeout);
    }
    export function removeTickerTimeoutsByAlias(
        alias: string,
        checkCanBeDeletedBeforeEnd: boolean,
    ) {
        _currentTickersTimeouts.forEach((tickerTimeout, timeout) => {
            const aliasesWithoutAliasToRemove = tickerTimeout.aliases.filter((t) => t !== alias);
            if (aliasesWithoutAliasToRemove.length === 0) {
                const canBeDeletedBeforeEnd = tickerTimeout.canBeDeletedBeforeEnd;
                if (!checkCanBeDeletedBeforeEnd || canBeDeletedBeforeEnd) {
                    removeTickerTimeout(timeout);
                }
            } else {
                tickerTimeout.aliases = aliasesWithoutAliasToRemove;
            }
        });
    }
}
