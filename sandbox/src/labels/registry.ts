import type { Label, LabelSteps } from "@drincs/pixi-vn";
import { newLabel } from "@drincs/pixi-vn";

export interface TestLabelEntry {
    id: string;
    title: string;
}

/**
 * Every sandbox test label registers itself here so the start menu (see ./start.ts)
 * can list it without maintaining a separate hardcoded list.
 */
export const testLabels: TestLabelEntry[] = [];

/**
 * Same as `newLabel`, but also lists the label in the sandbox start menu.
 * Use this (instead of `newLabel` directly) for every label added under sandbox/src/labels
 * that a human or an agent should be able to reach from the sandbox root menu.
 */
export function registerTestLabel<T extends {} = {}>(
    id: string,
    title: string,
    steps: LabelSteps<T> | (() => LabelSteps<T>),
): Label<T> {
    testLabels.push({ id, title });
    return newLabel(id, steps);
}
