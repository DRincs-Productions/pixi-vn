import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import type AudioFilter from "@sound/interfaces/AudioFilter";
import SoundManagerStatic from "@sound/SoundManagerStatic";
import type SoundFilterMemory from "@sound/types/SoundFilterMemory";
import { logger } from "@utils/log-utility";
import { ToneAudioBuffer } from "tone";

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
export function FilterMemoryToFilter(filter: SoundFilterMemory[]): AudioFilter[] {
    const res: AudioFilter[] = [];
    for (const f of filter) {
        if (
            f.type === "TelephoneFilter" ||
            f.type === "StreamFilter" ||
            f.type === "StereoFilter" ||
            f.type === "ReverbFilter" ||
            f.type === "MonoFilter" ||
            f.type === "EqualizerFilter" ||
            f.type === "DistortionFilter"
        ) {
            // Return a plain AudioFilter stub that carries the serialised data.
            // TODO: replace with real Tone.js effect implementations.
            res.push({ filterType: f.type, ...f } as AudioFilter & Record<string, unknown>);
        } else {
            logger.error("Unknown sound filter type");
        }
    }
    return res;
}

/**
 * Serialises {@link AudioFilter} instances into their
 * {@link SoundFilterMemory} representations so they can be saved and
 * restored later.
 */
export function FilterToFilterMemory(filter?: AudioFilter[]): SoundFilterMemory[] | undefined {
    if (!filter) return undefined;
    const res: SoundFilterMemory[] = [];
    for (const f of filter) {
        const data = f as unknown as Record<string, unknown>;
        switch (f.filterType) {
            case "TelephoneFilter":
                res.push({ type: "TelephoneFilter" });
                break;
            case "StreamFilter":
                res.push({ type: "StreamFilter" });
                break;
            case "StereoFilter":
                res.push({ type: "StereoFilter", pan: data["pan"] as number | undefined });
                break;
            case "ReverbFilter":
                res.push({
                    type: "ReverbFilter",
                    seconds: data["seconds"] as number | undefined,
                    decay: data["decay"] as number | undefined,
                    reverse: data["reverse"] as boolean | undefined,
                });
                break;
            case "MonoFilter":
                res.push({ type: "MonoFilter" });
                break;
            case "EqualizerFilter":
                res.push({
                    type: "EqualizerFilter",
                    f32: data["f32"] as number | undefined,
                    f64: data["f64"] as number | undefined,
                    f125: data["f125"] as number | undefined,
                    f250: data["f250"] as number | undefined,
                    f500: data["f500"] as number | undefined,
                    f1k: data["f1k"] as number | undefined,
                    f2k: data["f2k"] as number | undefined,
                    f4k: data["f4k"] as number | undefined,
                    f8k: data["f8k"] as number | undefined,
                    f16k: data["f16k"] as number | undefined,
                });
                break;
            case "DistortionFilter":
                res.push({
                    type: "DistortionFilter",
                    amount: data["amount"] as number | undefined,
                });
                break;
            default:
                logger.error("Unknown sound filter type");
        }
    }
    return res;
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
