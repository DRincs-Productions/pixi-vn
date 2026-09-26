export { default as TickerBase } from "@tickers/classes/TickerBase";
export type { default as TickerValue } from "@tickers/classes/TickerValue";
export { default as RegisteredTickers, tickerDecorator } from "@tickers/decorators/RegisteredTickers";
export type { default as Ticker } from "@tickers/interfaces/Ticker";
export type { default as TickerArgs } from "@tickers/interfaces/TickerArgs";
export type { TickerHistory, default as TickerInfo } from "@tickers/interfaces/TickerInfo";
export type {
    TickerProgrationExponential,
    TickerProgrationLinear,
    default as TickerProgrationType,
} from "@tickers/interfaces/TickerProgrationType";
export type { default as TickersInterface } from "@tickers/interfaces/TickersInterface";
export type { default as TickersSequence } from "@tickers/interfaces/TickersSequence";
export type { default as TickerTimeoutHistory } from "@tickers/interfaces/TickerTimeoutHistory";
export type { CommonTickerProps } from "@tickers/types/CommonTickerProps";

import { GameUnifier } from "@drincs/pixi-vn/core";
import { createExportableElement } from "@utils/export-utility";
import { logger } from "@utils/log-utility";
import RegisteredTickers from "@tickers/decorators/RegisteredTickers";
import type Ticker from "@tickers/interfaces/Ticker";
import type TickerArgs from "@tickers/interfaces/TickerArgs";
import type TickerInfo from "@tickers/interfaces/TickerInfo";
import type TickersInterface from "@tickers/interfaces/TickersInterface";
import type TickersSequence from "@tickers/interfaces/TickersSequence";
import type { TickersStep } from "@tickers/interfaces/TickersSequence";
import { TickersManagerStatic } from "@tickers/TickersManagerStatic";
import { aliasToRemoveAfter } from "@tickers/types/AliasToRemoveAfterType";

function findTicker<TArgs extends TickerArgs>(tickerId: string): Ticker<TArgs> | undefined {
    const ticker = TickersManagerStatic._currentTickers.get(tickerId);
    if (ticker) {
        return ticker.ticker as Ticker<TArgs>;
    }
    return undefined;
}

function addTicker<TArgs extends TickerArgs>(
    canvasElementAlias: string | string[],
    ticker: Ticker<TArgs>,
) {
    const id = ticker.id;
    const tickerName: string = ticker.alias;
    if (typeof canvasElementAlias === "string") {
        canvasElementAlias = [canvasElementAlias];
    }
    ticker.canvasElementAliases = canvasElementAlias;
    if (!RegisteredTickers.has(tickerName)) {
        logger.error(`Ticker ${tickerName} not found`);
        return;
    }
    const tickerHistory: TickerInfo<TArgs> = {
        ticker: ticker,
    };
    TickersManagerStatic._currentTickers.set(id, tickerHistory);
    tickerHistory.ticker.start();
    if (ticker.duration) {
        const timeout = setTimeout(() => {
            TickersManagerStatic.removeTickerTimeoutInfo(timeout);
            const tickerTimeoutInfo = TickersManagerStatic._currentTickersTimeouts.get(
                timeout.toString(),
            );
            if (tickerTimeoutInfo) {
                tickerHistory.ticker.complete({ ignoreTickerSteps: true });
            }
        }, ticker.duration * 1000);
        TickersManagerStatic.addTickerTimeoutInfo(
            canvasElementAlias,
            tickerName,
            timeout.toString(),
            true,
        );
    }
    return id;
}

function addSequence(alias: string, steps: Ticker<any>[], currentStepNumber = 0) {
    if (steps.length === 0) {
        logger.warn("The steps of the tickers is empty");
        return;
    }
    if (!TickersManagerStatic._currentTickersSequence.has(alias)) {
        TickersManagerStatic._currentTickersSequence.set(alias, new Map());
    }
    const step: TickersSequence = {
        currentStepNumber: currentStepNumber,
        steps: steps.map((step) => {
            const tickerId = (step as Ticker<any>).alias;
            return {
                ticker: tickerId,
                args: createExportableElement((step as Ticker<any>).args),
                duration: step.duration,
            };
        }),
    };
    const key = TickersManagerStatic.generateTickerId(step);
    TickersManagerStatic._currentTickersSequence.get(alias)?.set(key, step);
    runTickersSequence(alias, key);
    return key;
}

/**
 * Runs (or resumes) a single step of a ticker sequence. Exported (beyond the {@link tickers} public
 * surface) because `CanvasManager.restore()` reconstructs sequences from serialized save data at a
 * lower level than {@link addSequence} operates at.
 */
export function runTickersSequence<TArgs extends TickerArgs>(alias: string, key: string) {
    const aliasMap = TickersManagerStatic._currentTickersSequence.get(alias);
    if (!aliasMap?.has(key)) {
        return;
    }
    const step = aliasMap.get(key)!.steps[aliasMap.get(key)!.currentStepNumber];
    const ticker = RegisteredTickers.getInstance<TArgs>(
        (step as TickersStep<TArgs>).ticker,
        (step as TickersStep<TArgs>).args,
        {
            canvasElementAliases: [alias],
            duration: (step as TickersStep<TArgs>).duration,
            priority: (step as TickersStep<TArgs>).priority,
        },
    );
    if (!ticker) {
        logger.error(`Ticker ${(step as TickersStep<TArgs>).ticker} not found`);
        return;
    }
    const tickerName: string = ticker.alias;
    const id = ticker.id;
    ticker.canvasElementAliases = [alias];
    const tickerHistory: TickerInfo<TArgs> = {
        createdByTicketSteps: {
            canvasElementAlias: alias,
            id: key,
        },
        ticker: ticker,
    };
    TickersManagerStatic._currentTickers.set(id, tickerHistory);
    tickerHistory.ticker.start();
    if (ticker.duration) {
        const timeout = setTimeout(() => {
            const tickerTimeoutInfo = TickersManagerStatic._currentTickersTimeouts.get(
                timeout.toString(),
            );
            if (tickerTimeoutInfo) {
                tickerHistory.ticker.complete({ ignoreTickerSteps: true });
                tickerTimeoutInfo.aliases.forEach((alias) => {
                    nextTickerStep(alias, key);
                });
            }
            TickersManagerStatic.removeTickerTimeoutInfo(timeout);
        }, ticker.duration * 1000);
        TickersManagerStatic.addTickerTimeoutInfo(alias, tickerName, timeout.toString(), false);
    }
}

function nextTickerStep(alias: string, key: string) {
    const aliasMap = TickersManagerStatic._currentTickersSequence.get(alias);
    if (aliasMap?.has(key)) {
        const steps = aliasMap.get(key)!;
        if (steps.currentStepNumber + 1 < steps.steps.length) {
            steps.currentStepNumber++;
            aliasMap.set(key, steps);
            runTickersSequence(alias, key);
        } else {
            if (key && aliasMap.has(key)) {
                aliasMap.delete(key);
                TickersManagerStatic._currentTickers.forEach((ticker, id) => {
                    if (ticker.createdByTicketSteps?.canvasElementAlias === alias) {
                        if (ticker.createdByTicketSteps.id === key) {
                            removeTicker(id);
                        }
                    }
                });
            }
        }
    }
}

function onComplete(
    tickerId: string,
    options: {
        aliasToRemoveAfter: string[];
        tickerAliasToResume: string[];
        tickerIdToResume: string[];
        ignoreTickerSteps?: boolean;
        stopTicker?: boolean;
    },
) {
    const {
        stopTicker = true,
        aliasToRemoveAfter,
        tickerAliasToResume,
        tickerIdToResume,
    } = options;
    const info = TickersManagerStatic._currentTickers.get(tickerId);
    const ignoreTickerSteps = options.ignoreTickerSteps || false;
    GameUnifier.removeCanvasComponent(aliasToRemoveAfter);
    tickerAliasToResume.forEach((alias) => {
        resume({ canvasAlias: alias });
    });
    resume({ id: tickerIdToResume });
    if (info) {
        removeTicker(tickerId, { stopTicker: stopTicker });
        if (!ignoreTickerSteps && info.ticker.duration === undefined && info.createdByTicketSteps) {
            nextTickerStep(
                info.createdByTicketSteps.canvasElementAlias,
                info.createdByTicketSteps.id,
            );
        }
    }
}

function unlinkComponent(
    alias: string | string[],
    ticker?: { new (args: any, duration?: number, priority?: any): Ticker<any> } | string,
) {
    if (typeof alias === "string") {
        alias = [alias];
    }

    if (!ticker) {
        alias.forEach((alias) => {
            TickersManagerStatic._currentTickers.forEach((info, id) => {
                if (info.ticker.canvasElementAliases.includes(alias)) {
                    if (info.ticker.canvasElementAliases.length === 1) {
                        removeTicker(id);
                    } else {
                        info.ticker.canvasElementAliases = info.ticker.canvasElementAliases.filter(
                            (t) => t !== alias,
                        );
                    }
                }
            });
            if (TickersManagerStatic._currentTickersSequence.has(alias)) {
                TickersManagerStatic._currentTickersSequence.delete(alias);
            }
            TickersManagerStatic.removeTickerTimeoutsByAlias(alias, false);
        });
        return;
    }

    let tickerId: string;
    if (typeof ticker === "string") {
        tickerId = ticker;
    } else {
        tickerId = ticker.prototype.id;
    }
    alias.forEach((alias) => {
        const aliasMap = TickersManagerStatic._currentTickersSequence.get(alias);
        if (aliasMap) {
            aliasMap.forEach((ticker, id) => {
                if (
                    ticker.steps.find(
                        (t) => typeof t === "object" && "ticker" in t && t.ticker === tickerId,
                    )
                ) {
                    aliasMap.delete(id);
                }
            });
        }
    });
    TickersManagerStatic._currentTickers.forEach((info) => {
        if (info.ticker.alias === tickerId) {
            info.ticker.canvasElementAliases = info.ticker.canvasElementAliases.filter(
                (e) => !(alias as string[]).includes(e),
            );
        }
    });
    TickersManagerStatic._currentTickersTimeouts.forEach((tickerTimeout) => {
        if (tickerTimeout.ticker === tickerId && tickerTimeout.canBeDeletedBeforeEnd) {
            tickerTimeout.aliases = tickerTimeout.aliases.filter(
                (t) => !(alias as string[]).includes(t),
            );
        }
    });
    removeTickersWithoutAssociatedCanvasElement();
}

/**
 * Remove all tickers that are not connected to any existing canvas element.
 */
function removeTickersWithoutAssociatedCanvasElement() {
    TickersManagerStatic._currentTickers.forEach((info) => {
        info.ticker.canvasElementAliases = info.ticker.canvasElementAliases.filter((e) =>
            GameUnifier.canvasComponentExists(e),
        );
        if (info.ticker.canvasElementAliases.length === 0) {
            info.ticker.complete({ ignoreTickerSteps: true });
        }
    });
    TickersManagerStatic._currentTickersSequence.forEach((ticker, alias) => {
        if (ticker === undefined) {
            TickersManagerStatic._currentTickersSequence.delete(alias);
        }
    });
    Array.from(TickersManagerStatic._currentTickersTimeouts.keys()).forEach((timeout) => {
        const info = TickersManagerStatic._currentTickersTimeouts.get(timeout);
        if (info && info.aliases.length === 0) {
            TickersManagerStatic.removeTickerTimeout(timeout);
        }
    });
}

function removeAll() {
    TickersManagerStatic._currentTickersSequence.clear();
    Array.from(TickersManagerStatic._currentTickers.keys()).forEach((id) => {
        removeTicker(id);
    });
    TickersManagerStatic._currentTickers.clear();
    Array.from(TickersManagerStatic._currentTickersTimeouts.keys()).forEach((timeout) => {
        TickersManagerStatic.removeTickerTimeout(timeout);
    });
    TickersManagerStatic._tickersToCompleteOnStepEnd.tikersIds.length = 0;
    TickersManagerStatic._tickersToCompleteOnStepEnd.stepAlias.length = 0;
}

/**
 * Removes one or more tickers by id, with an extra `stopTicker` option beyond what
 * {@link tickers}.remove exposes - kept as its own named export for `CanvasManager`'s deprecated
 * `removeTicker(tickerId, options)` flat method, which historically supported it.
 */
export function removeTicker(
    tickerId: string | string[],
    options: { stopTicker?: boolean } = { stopTicker: true },
) {
    if (typeof tickerId === "string") {
        tickerId = [tickerId];
    }
    tickerId.forEach((tickerId) => {
        const info = TickersManagerStatic._currentTickers.get(tickerId);
        if (info) {
            options.stopTicker && info.ticker.stop();
            TickersManagerStatic._currentTickers.delete(tickerId);
        }
    });
}

function pause(
    filters: { canvasAlias: string; tickerIdsExcluded?: string[] } | { id: string | string[] },
): string[] {
    const ids: string[] = [];
    if ("canvasAlias" in filters) {
        const { canvasAlias, tickerIdsExcluded = [] } = filters;
        TickersManagerStatic._currentTickers.forEach((info, id) => {
            if (
                info.ticker.canvasElementAliases.includes(canvasAlias) &&
                !tickerIdsExcluded.includes(info.ticker.alias) &&
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
        [...new Set(id)].forEach((id) => {
            const info = TickersManagerStatic._currentTickers.get(id);
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

function resume(filters: { canvasAlias: string } | { id: string | string[] }): void {
    if ("canvasAlias" in filters) {
        const { canvasAlias } = filters;
        TickersManagerStatic._currentTickers.forEach((info) => {
            if (info.ticker.canvasElementAliases.includes(canvasAlias)) {
                info.ticker.play();
            }
        });
    } else if ("id" in filters) {
        let { id } = filters;
        if (typeof id === "string") {
            id = [id];
        }
        [...new Set(id)].forEach((id) => {
            const info = TickersManagerStatic._currentTickers.get(id);
            if (info) {
                info.ticker.play();
            } else {
                logger.error(`Ticker with id ${id} not found`);
            }
        });
    }
}

function isPaused(_alias: string, _tickerId?: string): boolean {
    return false;
}

function transfer(oldAlias: string, newAlias: string, mode: "move" | "duplicate" = "move") {
    const oldSeq = TickersManagerStatic._currentTickersSequence.get(oldAlias);
    if (oldSeq) {
        const cloned = new Map(
            Array.from(oldSeq.entries()).map(([k, v]) => [k, createExportableElement(v)]),
        );
        TickersManagerStatic._currentTickersSequence.set(newAlias, cloned);
    }
    TickersManagerStatic._currentTickers.forEach((info, id) => {
        if (info.createdByTicketSteps?.canvasElementAlias === oldAlias) {
            removeTicker(id);
        }
        if (info.ticker.canvasElementAliases.includes(oldAlias)) {
            const ticker = RegisteredTickers.getInstance(
                info.ticker.alias,
                createExportableElement(info.ticker.args),
                {
                    duration: info.ticker.duration,
                    priority: info.ticker.priority,
                    canvasElementAliases: [newAlias],
                },
            );
            if (ticker) {
                addTicker(newAlias, ticker);
                if (info.ticker.paused) {
                    ticker.pause();
                }
            } else {
                logger.error(`Ticker ${info.ticker.alias} not found`);
            }

            if (mode === "move") {
                info.ticker.canvasElementAliases = info.ticker.canvasElementAliases.filter(
                    (alias) => alias !== oldAlias,
                );
            }

            if (Object.hasOwn(info.ticker.args, aliasToRemoveAfter)) {
                let aliasToRemoveAfterValue: string | string[] =
                    info.ticker.args.aliasToRemoveAfter;
                if (typeof aliasToRemoveAfterValue === "string") {
                    aliasToRemoveAfterValue = [aliasToRemoveAfterValue];
                }
                if (Array.isArray(aliasToRemoveAfterValue)) {
                    if (mode === "move") {
                        info.ticker.args.aliasToRemoveAfter = aliasToRemoveAfterValue.map((t) =>
                            t === oldAlias ? newAlias : t,
                        );
                    } else if (mode === "duplicate") {
                        if (aliasToRemoveAfterValue.find((t) => t === oldAlias)) {
                            info.ticker.args.aliasToRemoveAfter = [
                                ...aliasToRemoveAfterValue,
                                newAlias,
                            ];
                        }
                    }
                }
            }
        }
    });
    TickersManagerStatic._currentTickersTimeouts.forEach((tickerTimeout) => {
        if (tickerTimeout.aliases.includes(oldAlias)) {
            if (mode === "move") {
                tickerTimeout.aliases = tickerTimeout.aliases.map((t) =>
                    t === oldAlias ? newAlias : t,
                );
            } else if (mode === "duplicate") {
                if (tickerTimeout.aliases.find((t) => t === oldAlias)) {
                    tickerTimeout.aliases.push(newAlias);
                }
            }
        }
    });
    const newSeq = TickersManagerStatic._currentTickersSequence.get(newAlias);
    if (newSeq) {
        newSeq.forEach((_, key) => {
            runTickersSequence(newAlias, key);
        });
    }
    if (mode === "duplicate") {
        const oldSeqForRun = TickersManagerStatic._currentTickersSequence.get(oldAlias);
        if (oldSeqForRun) {
            oldSeqForRun.forEach((_, key) => {
                runTickersSequence(oldAlias, key);
            });
        }
    }
}

function completeOnStepEnd(step: { id: string; alias?: string }) {
    if (step.alias) {
        TickersManagerStatic._tickersToCompleteOnStepEnd.stepAlias.push({
            id: step.id,
            alias: step.alias,
        });
    } else {
        TickersManagerStatic._tickersToCompleteOnStepEnd.tikersIds.push({ id: step.id });
    }
}

async function forceCompletion(id: string, alias?: string) {
    if (!alias) {
        const info = TickersManagerStatic._currentTickers.get(id);
        if (info) {
            await info.ticker.complete();
        }
    } else {
        const sequence = TickersManagerStatic._currentTickersSequence.get(alias);
        const tickerStep = sequence?.get(id);
        if (sequence && tickerStep) {
            const promises = tickerStep.steps.map((step) => {
                if (typeof step === "object" && "ticker" in step) {
                    const ticker = RegisteredTickers.getInstance<any>(
                        (step as TickersStep<any>).ticker,
                        (step as TickersStep<any>).args,
                        {
                            duration: (step as TickersStep<any>).duration,
                            canvasElementAliases: [alias],
                            priority: (step as TickersStep<any>).priority,
                        },
                    );
                    if (ticker) {
                        return ticker.complete();
                    }
                }
                return Promise.resolve();
            });
            await Promise.all(promises);
        }
    }
}

/**
 * Drains the `completeOnStepEnd` queue, returning what was in it. Used by `canvas/index.ts`'s
 * pre-continue handler, which used to reach into `CanvasManagerStatic._tickersToCompleteOnStepEnd`
 * directly - draining through this function keeps that state fully encapsulated in this module.
 */
export function drainCompleteOnStepEndQueue(): {
    tikersIds: { id: string }[];
    stepAlias: { id: string; alias: string }[];
} {
    const tikersIds = TickersManagerStatic._tickersToCompleteOnStepEnd.tikersIds.splice(
        0,
        TickersManagerStatic._tickersToCompleteOnStepEnd.tikersIds.length,
    );
    const stepAlias = TickersManagerStatic._tickersToCompleteOnStepEnd.stepAlias.splice(
        0,
        TickersManagerStatic._tickersToCompleteOnStepEnd.stepAlias.length,
    );
    return { tikersIds, stepAlias };
}

/**
 * Namespace for operations on tickers - the frame-by-frame animation primitive every Pixi'VN
 * animation (`canvas.animate`, transitions, custom `TickerBase` subclasses) is built on.
 */
export const tickers: TickersInterface = {
    transfer,
    get currentTickers() {
        return TickersManagerStatic._currentTickers;
    },
    get currentTickersSteps() {
        return TickersManagerStatic._currentTickersSequence;
    },
    find: findTicker,
    add: addTicker,
    addSequence,
    unlinkComponent,
    removeAll,
    remove: removeTicker,
    pause,
    resume,
    isPaused,
    completeOnStepEnd,
    forceCompletion,
    onComplete,
};

export { TickersManagerStatic } from "@tickers/TickersManagerStatic";
