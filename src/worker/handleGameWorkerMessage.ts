import type { GameWorkerRequest, GameWorkerResponse } from "@worker/interfaces/GameWorkerMessage";
import { restoreDiffChanges } from "@utils/diff-utility";
import diff from "microdiff";
import { getGameWorkerHandler } from "./GameWorkerHandlerRegistry";

/**
 * The worker-side half of the {@link GameWorkerManager} protocol. The game project creates its
 * own Worker (so it controls the bundler-specific setup) and points its `message` handling here:
 *
 * ```ts
 * // game-worker.ts, built as its own entry by the project's bundler
 * import { handleGameWorkerMessage } from "@drincs/pixi-vn/worker";
 *
 * self.onmessage = async (event) => {
 *     const response = await handleGameWorkerMessage(event.data);
 *     if (response) self.postMessage(response);
 * };
 * ```
 *
 * A third-party library sharing this same worker (see `registerGameWorkerHandler`) just needs
 * its own worker-side registration module imported alongside this one, in that same file.
 *
 * Everything this processes is plain, structured-clone-safe data by construction - it never
 * touches PixiJS/canvas/audio, which only exist on the main thread.
 */
export async function handleGameWorkerMessage(
    request: GameWorkerRequest,
): Promise<GameWorkerResponse> {
    try {
        switch (request.type) {
            case "restore-diff": {
                const result = restoreDiffChanges(request.state, request.diff);
                return { id: request.id, type: "restore-diff-result", result };
            }
            case "diff": {
                const result = diff(request.before, request.after);
                return { id: request.id, type: "diff-result", result };
            }
            case "clone": {
                const result = JSON.parse(JSON.stringify(request.value));
                return { id: request.id, type: "clone-result", result };
            }
            case "custom": {
                const handler = getGameWorkerHandler(request.kind);
                if (!handler) {
                    throw new Error(`No game worker handler registered for kind "${request.kind}"`);
                }
                const result = await handler(request.payload);
                return { id: request.id, type: "custom-result", result };
            }
        }
    } catch (e) {
        return {
            id: request.id,
            type: "error",
            error: e instanceof Error ? e.message : String(e),
        };
    }
}
