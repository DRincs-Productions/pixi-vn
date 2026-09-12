import type { GameWorkerRequest, GameWorkerResponse } from "@worker/interfaces/GameWorkerMessage";
import { logger } from "@utils/log-utility";
import type { Difference } from "microdiff";

type PendingEntry = {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
};

// Plain `Omit` doesn't distribute over a union: `keyof` on a union collapses to the
// intersection of its members' keys, so `Omit<GameWorkerRequest, "id">` loses the discriminated
// union entirely. This re-applies `Omit` to each member individually instead.
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

/**
 * Optional integration point for offloading Pixi'VN's own heavy, pure (no DOM/PixiJS/audio)
 * computations to a Worker the game project registers. Pixi'VN never creates a Worker itself
 * and works exactly as before if none is registered - this is opt-in, not a requirement, so
 * projects that can't or don't want to use Workers (SSR, certain embeds, ...) are unaffected.
 *
 * The game project owns the `Worker` instance (so it controls the bundler-specific `new
 * Worker(new URL(...), { type: "module" })` call, any CSP/nonce concerns, and whether it exists
 * at all) and just needs its `onmessage` wired to {@link handleGameWorkerMessage} - see that
 * function's doc comment for the worker-side half of this.
 */
export default class GameWorkerManager {
    private static _worker: Worker | undefined;
    private static _pending = new Map<number, PendingEntry>();
    private static _nextId = 0;

    static get isAvailable(): boolean {
        return GameWorkerManager._worker !== undefined;
    }

    /**
     * Registers the Worker Pixi'VN may use for eligible heavy computations. Replaces any
     * previously registered worker (its still-pending requests are rejected, never left
     * hanging).
     */
    static register(worker: Worker) {
        GameWorkerManager.unregister();
        GameWorkerManager._worker = worker;
        worker.addEventListener("message", GameWorkerManager._handleMessage);
    }

    /** Stops using the registered worker (does not terminate it - the caller owns its lifecycle). */
    static unregister() {
        const worker = GameWorkerManager._worker;
        if (!worker) {
            return;
        }
        worker.removeEventListener("message", GameWorkerManager._handleMessage);
        GameWorkerManager._worker = undefined;
        for (const { reject } of GameWorkerManager._pending.values()) {
            reject(new Error("Game worker was unregistered"));
        }
        GameWorkerManager._pending.clear();
    }

    private static _handleMessage = (event: MessageEvent<GameWorkerResponse>) => {
        const pending = GameWorkerManager._pending.get(event.data.id);
        if (!pending) {
            return;
        }
        GameWorkerManager._pending.delete(event.data.id);
        if (event.data.type === "error") {
            pending.reject(new Error(event.data.error));
        } else {
            pending.resolve(event.data.result);
        }
    };

    /**
     * Sends one {@link GameWorkerRequest} and resolves with its matching response's `result`.
     * Rejects if no worker is registered - callers are expected to fall back to computing the
     * same result synchronously in that case (see {@link restoreDiff}/{@link diff}/{@link clone}'s
     * own call sites), not to treat the worker as required.
     */
    private static _request(message: DistributiveOmit<GameWorkerRequest, "id">): Promise<unknown> {
        const worker = GameWorkerManager._worker;
        if (!worker) {
            return Promise.reject(new Error("No game worker is registered"));
        }
        const id = GameWorkerManager._nextId++;
        return new Promise((resolve, reject) => {
            GameWorkerManager._pending.set(id, { resolve, reject });
            try {
                worker.postMessage({ ...message, id });
            } catch (e) {
                GameWorkerManager._pending.delete(id);
                logger.error("Error posting message to game worker", e);
                reject(e);
            }
        });
    }

    /** Applies `diff` to `state` on the registered worker (see `restoreDiffChanges`). */
    static async restoreDiff<T extends object>(state: T, diff: Difference[]): Promise<T> {
        return (await GameWorkerManager._request({ type: "restore-diff", state, diff })) as T;
    }

    /** Computes the `microdiff` difference between `before` and `after` on the registered worker. */
    static async diff(before: object, after: object): Promise<Difference[]> {
        return (await GameWorkerManager._request({ type: "diff", before, after })) as Difference[];
    }

    /** Deep-clones `value` (JSON round-trip, matching `createExportableElement`) on the registered worker. */
    static async clone<T extends object>(value: T): Promise<T> {
        return (await GameWorkerManager._request({ type: "clone", value })) as T;
    }

    /**
     * Runs the handler a third-party library registered for `kind` (see
     * `registerGameWorkerHandler`) on the registered worker, passing it `payload`. Lets a
     * library built on top of Pixi'VN share this same worker instead of needing one of its own -
     * see that function's doc comment for the worker-side half of this.
     */
    static async custom<TResult = unknown>(kind: string, payload: unknown): Promise<TResult> {
        return (await GameWorkerManager._request({ type: "custom", kind, payload })) as TResult;
    }
}
