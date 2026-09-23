import type { Label, LabelSteps } from "@drincs/pixi-vn";
import { newLabel } from "@drincs/pixi-vn";

export interface TestLabelEntry {
    id: string;
    title: string;
    category: string;
}

/** Fallback category when `registerTestLabel` isn't given one explicitly: the text before the first
 * `:` in `title` (the existing "Canvas: ..." naming convention), or "Other" if there isn't one. */
function inferCategory(title: string): string {
    const [prefix, rest] = title.split(":");
    return rest !== undefined ? prefix.trim() : "Other";
}

/**
 * Every sandbox test label registers itself here so the start menu (see ./start.ts) and the App's
 * per-category accordion (see ../App.tsx) can list it without maintaining a separate hardcoded list.
 */
export const testLabels: TestLabelEntry[] = [];

/**
 * Same as `newLabel`, but also lists the label in the sandbox start menu.
 * Use this (instead of `newLabel` directly) for every label added under sandbox/src/labels
 * that a human or an agent should be able to reach from the sandbox root menu.
 * @param category Groups this label with others of the same category under one accordion in the
 * sandbox's start menu. Defaults to the text before the first `:` in `title` (e.g. "Canvas: blur
 * transition" -> "Canvas") - pass it explicitly once a module's labels grow past a handful and would
 * benefit from a finer split (e.g. "Canvas transitions" vs "Canvas regressions").
 */
export function registerTestLabel<T extends {} = {}>(
    id: string,
    title: string,
    steps: LabelSteps<T> | (() => LabelSteps<T>),
    category?: string,
): Label<T> {
    testLabels.push({ id, title, category: category ?? inferCategory(title) });
    return newLabel(id, steps);
}
