import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import SoundRegistry from "@sound/SoundRegistry";
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

export async function soundLoad(alias: string): Promise<void> {
    if (SoundRegistry.bufferRegistry.has(alias)) return;
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
        SoundRegistry.bufferRegistry.set(alias, buffer);
    } catch (e) {
        logger.warn(
            `Failed to load audio buffer for "${alias}" (url: "${url}"): ${e instanceof Error ? e.message : e}`,
        );
        // Register an empty stub so downstream code can proceed
        // without crashing (e.g. in test / headless environments).
        SoundRegistry.bufferRegistry.set(alias, new ToneAudioBuffer());
    }
}
