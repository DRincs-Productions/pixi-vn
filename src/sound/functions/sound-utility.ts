import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import SoundRegistry from "@sound/SoundRegistry";
import type SoundFilterMemory from "@sound/types/SoundFilterMemory";
import { logger } from "@utils/log-utility";
import {
    BitCrusher,
    Compressor,
    Delay,
    Distortion,
    FeedbackCombFilter,
    FeedbackDelay,
    Freeverb,
    Gate,
    GreaterThan,
    GreaterThanZero,
    type InputNode,
    Limiter,
    MidSideCompressor,
    MultibandCompressor,
    Panner3D,
    Phaser,
    PingPongDelay,
    Reverb,
    StereoWidener,
    Time,
    ToneAudioBuffer,
} from "tone";

/** Convert a linear [0, 1] gain value to decibels. */
export function linearToDecibels(v: number): number {
    return v <= 0 ? -Infinity : 20 * Math.log10(v);
}

/** Convert a decibel value to a linear [0, 1] gain. */
export function decibelsToLinear(db: number): number {
    return db <= -Infinity ? 0 : 10 ** (db / 20);
}

/**
 * Reconstructs {@link InputNode} instances from their serialised
 * {@link SoundFilterMemory} representations.
 *
 * Filter effects using Tone.js are a work-in-progress; currently the
 * returned objects are plain data containers that remember the filter
 * parameters for future use.
 */
export function FilterMemoryToFilter(filter: SoundFilterMemory[]): InputNode[] {
    return filter.reduce((res: InputNode[], f) => {
        switch (f.type) {
            case "ReverbFilter":
                res.push(
                    new Reverb({
                        decay: f.decay,
                        preDelay: f.preDelay,
                        wet: f.wet,
                    }),
                );
                break;
            case "FeedbackDelayFilter":
                res.push(
                    new FeedbackDelay({
                        feedback: f.feedback,
                        delayTime: f.delayTime,
                        wet: f.wet,
                    }),
                );
                break;
            case "BitCrusherFilter":
                res.push(
                    new BitCrusher({
                        bits: f.bits,
                    }),
                );
                break;
            case "CompressorFilter":
                res.push(
                    new Compressor({
                        attack: f.attack,
                        knee: f.knee,
                        ratio: f.ratio,
                        release: f.release,
                        threshold: f.threshold,
                    }),
                );
                break;
            case "DelayFilter":
                res.push(
                    new Delay({
                        delayTime: f.delayTime,
                        maxDelay: f.maxDelay,
                    }),
                );
                break;
            case "DistortionFilter":
                res.push(
                    new Distortion({
                        distortion: f.distortion,
                        oversample: f.oversample,
                        wet: f.wet,
                    }),
                );
                break;
            case "FeedbackCombFilterFilter":
                res.push(
                    new FeedbackCombFilter({
                        delayTime: f.delayTime,
                        resonance: f.resonance,
                    }),
                );
                break;
            case "FreeverbFilter":
                res.push(
                    new Freeverb({
                        roomSize: f.roomSize,
                        dampening: f.dampening,
                        wet: f.wet,
                    }),
                );
                break;
            case "GateFilter":
                res.push(
                    new Gate({
                        threshold: f.threshold,
                        smoothing: f.smoothing,
                    }),
                );
                break;
            case "GreaterThanFilter":
                res.push(
                    new GreaterThan({
                        value: f.value,
                        convert: f.convert,
                        maxValue: f.maxValue,
                        minValue: f.minValue,
                        units: f.units,
                    }),
                );
                break;
            case "GreaterThanZeroFilter":
                res.push(new GreaterThanZero());
                break;
            case "LimiterFilter":
                res.push(
                    new Limiter({
                        threshold: f.threshold,
                    }),
                );
                break;
            case "MidSideCompressorFilter":
                res.push(
                    new MidSideCompressor({
                        mid: f.mid,
                        side: f.side,
                    }),
                );
                break;
            case "MultibandCompressorFilter":
                res.push(
                    new MultibandCompressor({
                        lowFrequency: f.lowFrequency,
                        highFrequency: f.highFrequency,
                        low: f.low,
                        mid: f.mid,
                        high: f.high,
                    }),
                );
                break;
            case "Panner3DFilter":
                res.push(
                    new Panner3D({
                        positionX: f.positionX,
                        positionY: f.positionY,
                        positionZ: f.positionZ,
                        orientationX: f.orientationX,
                        orientationY: f.orientationY,
                        orientationZ: f.orientationZ,
                        coneInnerAngle: f.coneInnerAngle,
                        coneOuterAngle: f.coneOuterAngle,
                        coneOuterGain: f.coneOuterGain,
                        distanceModel: f.distanceModel,
                        maxDistance: f.maxDistance,
                        refDistance: f.refDistance,
                        rolloffFactor: f.rolloffFactor,
                        panningModel: f.panningModel,
                    }),
                );
                break;
            case "PhaserFilter":
                res.push(
                    new Phaser({
                        frequency: f.frequency,
                        octaves: f.octaves,
                        baseFrequency: f.baseFrequency,
                        wet: f.wet,
                        Q: f.Q,
                        stages: f.stages,
                    }),
                );
                break;
            case "StereoWidenerFilter":
                res.push(
                    new StereoWidener({
                        width: f.width,
                        wet: f.wet,
                    }),
                );
                break;
            case "PingPongDelayFilter":
                res.push(
                    new PingPongDelay({
                        wet: f.wet,
                        delayTime: f.delayTime,
                        feedback: f.feedback,
                        maxDelay: f.maxDelay,
                    }),
                );
                break;
        }
        return res;
    }, []);
}

/**
 * Serialises {@link InputNode} instances into their
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
                decay: Time(f.decay).toSeconds(),
                preDelay: Time(f.preDelay).toSeconds(),
            });
        } else if (f instanceof FeedbackDelay) {
            res.push({
                type: "FeedbackDelayFilter",
                feedback: f.feedback.toSeconds(),
                delayTime: f.delayTime.toSeconds(),
                wet: f.wet.toSeconds(),
            });
        } else {
            logger.warn(
                `Unsupported filter type for serialisation: ${f.constructor.name}, please report this to the developers if you encounter it.`,
            );
        }
        return res;
    }, []);
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
