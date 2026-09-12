import { logger } from "@utils/log-utility";
import { restoreDiffChanges } from "@utils/diff-utility";
import { createExportableElement } from "@utils/export-utility";
import diff, { type Difference } from "microdiff";
import GameWorkerManager from "./GameWorkerManager";

/**
 * Applies `stateDiff` to `state`, via the registered game worker if one is available (see
 * `Game.worker`), falling back to computing it synchronously on the main thread otherwise -
 * whether that's because no worker was registered, or because the worker call itself failed (the
 * caller should never hard-fail just because the optional worker hiccuped).
 */
export async function restoreDiffMaybeOffloaded<T extends object>(
    state: T,
    stateDiff: Difference[],
): Promise<T> {
    if (GameWorkerManager.isAvailable) {
        try {
            return await GameWorkerManager.restoreDiff(state, stateDiff);
        } catch (e) {
            logger.warn("Game worker failed to restore diff, falling back to the main thread", e);
        }
    }
    return restoreDiffChanges(state, stateDiff);
}

/**
 * Computes the difference between `before` and `after`, via the registered game worker if
 * available, falling back to the main thread otherwise. Mirrors
 * {@link restoreDiffMaybeOffloaded} - same worker, opposite direction.
 */
export async function diffMaybeOffloaded(before: object, after: object): Promise<Difference[]> {
    if (GameWorkerManager.isAvailable) {
        try {
            return await GameWorkerManager.diff(before, after);
        } catch (e) {
            logger.warn("Game worker failed to compute diff, falling back to the main thread", e);
        }
    }
    return diff(before, after);
}

/**
 * Deep-clones `value` (matching `createExportableElement`'s JSON-round-trip semantics), via the
 * registered game worker if available, falling back to the main thread otherwise.
 */
export async function cloneMaybeOffloaded<T extends object>(value: T): Promise<T> {
    if (GameWorkerManager.isAvailable) {
        try {
            return await GameWorkerManager.clone(value);
        } catch (e) {
            logger.warn("Game worker failed to clone value, falling back to the main thread", e);
        }
    }
    return createExportableElement(value);
}
