import type { Difference } from "microdiff";

/**
 * Message protocol between the main thread and an optional {@link GameWorker}-registered
 * Worker. Kept intentionally small: each request names one unit of work Pixi'VN (or a
 * third-party library building on it, via `"custom"` - see `registerGameWorkerHandler`) knows
 * how to hand off, and the worker replies with the same `id` so the caller can match the
 * response.
 *
 * This protocol (and everything it carries) only ever deals with plain, structured-clone-safe
 * data - never PixiJS/canvas/audio objects, which can't leave the main thread.
 */
export type GameWorkerRequest =
    | {
          id: number;
          type: "restore-diff";
          /** The base state to apply `diff` to (not mutated). */
          state: object;
          diff: Difference[];
      }
    | {
          id: number;
          type: "diff";
          /** The two states to compare (neither is mutated). */
          before: object;
          after: object;
      }
    | {
          id: number;
          type: "clone";
          /** The value to deep-clone. */
          value: object;
      }
    | {
          id: number;
          type: "custom";
          /** Identifies which registered handler (see `registerGameWorkerHandler`) should run. */
          kind: string;
          payload: unknown;
      };

export type GameWorkerResponse =
    | { id: number; type: "restore-diff-result"; result: object }
    | { id: number; type: "diff-result"; result: Difference[] }
    | { id: number; type: "clone-result"; result: object }
    | { id: number; type: "custom-result"; result: unknown }
    | { id: number; type: "error"; error: string };
