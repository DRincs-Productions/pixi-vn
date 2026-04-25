import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import SoundManagerStatic from "@sound/SoundManagerStatic";
import type SoundFilterMemory from "@sound/types/SoundFilterMemory";
import { logger } from "@utils/log-utility";
import * as Tone from "tone";
import { type InputNode, Reverb, ToneAudioBuffer } from "tone";

/** Convert a linear [0, 1] gain value to decibels. */
export function linearToDecibels(v: number): number {
    return v <= 0 ? -Infinity : 20 * Math.log10(v);
}

/** Convert a decibel value to a linear [0, 1] gain. */
export function decibelsToLinear(db: number): number {
    return db <= -Infinity ? 0 : 10 ** (db / 20);
}

/**
 * Reconstructs {@link AudioFilter} instances from their serialised
 * {@link SoundFilterMemory} representations.
 *
 * Filter effects using Tone.js are a work-in-progress; currently the
 * returned objects are plain data containers that remember the filter
 * parameters for future use.
 */
export function FilterMemoryToFilter(filter: SoundFilterMemory[]): InputNode[] {
    return filter.reduce((res: InputNode[], f) => {
        if (f.type === "ReverbFilter") {
            res.push(
                new Reverb({
                    decay: f.decay,
                    preDelay: f.preDelay,
                    wet: f.wet,
                }),
            );
        }
        return res;
    }, []);
}

/**
 * Serialises {@link AudioFilter} instances into their
 * {@link SoundFilterMemory} representations so they can be saved and
 * restored later.
 */
export function FilterToFilterMemory(filter?: InputNode[]): SoundFilterMemory[] | undefined {
    if (!filter) return undefined;
    return filter.reduce((res: SoundFilterMemory[], f) => {
        if (f instanceof Reverb) {
            res.push({
                type: "ReverbFilter",
                wet: f.wet.toSeconds(),
                decay: Tone.Time(f.decay).toSeconds(),
                preDelay: Tone.Time(f.preDelay).toSeconds(),
            });
        }
        return res;
    }, []);
}

export async function soundLoad(alias: string): Promise<void> {
    if (SoundManagerStatic.bufferRegistry.has(alias)) return;
    // Resolve via PIXI.Assets when the alias has been registered
    // there; fall back to using the alias as a raw URL.
    let url: string = alias;
    try {
        const resolved = PIXI.Assets.resolver.resolve(alias);
        if (resolved?.src) url = resolved.src;
    } catch {
        // Not registered in PIXI.Assets — use alias as URL.
    }
    try {
        // Load the raw AudioBuffer, then wrap it in a ToneAudioBuffer.
        // Using the static ToneAudioBuffer.load() + try/catch instead of
        // the constructor avoids an unhandled-rejection timing issue that
        // occurs when loading invalid URLs in test environments.
        const audioBuffer = await ToneAudioBuffer.load(url);
        const buffer = new ToneAudioBuffer(audioBuffer as unknown as AudioBuffer);
        SoundManagerStatic.bufferRegistry.set(alias, buffer);
    } catch (e) {
        logger.warn(
            `Failed to load audio buffer for "${alias}" (url: "${url}"): ${e instanceof Error ? e.message : e}`,
        );
        // Register an empty stub so downstream code can proceed
        // without crashing (e.g. in test / headless environments).
        SoundManagerStatic.bufferRegistry.set(alias, new ToneAudioBuffer());
    }
}
