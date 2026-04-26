import { default as PIXI } from "@drincs/pixi-vn/pixi.js";
import SoundRegistry from "@sound/SoundRegistry";
import type SoundFilterMemory from "@sound/types/SoundFilterMemory";
import { logger } from "@utils/log-utility";
import {
    AutoFilter,
    AutoPanner,
    BiquadFilter,
    BitCrusher,
    Chorus,
    Compressor,
    Delay,
    Distortion,
    FeedbackCombFilter,
    FeedbackDelay,
    Filter,
    Freeverb,
    Gate,
    GreaterThan,
    GreaterThanZero,
    type InputNode,
    Limiter,
    MidSideCompressor,
    MultibandCompressor,
    OnePoleFilter,
    Panner3D,
    Phaser,
    PingPongDelay,
    Reverb,
    StereoWidener,
    Time,
    ToneAudioBuffer,
    Tremolo,
    Vibrato,
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
 */
export function FilterMemoryToFilter(filter: SoundFilterMemory[]): InputNode[] {
    return filter.reduce((res: InputNode[], f) => {
        switch (f.filterType) {
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
            case "AutoFilterFilter":
                res.push(
                    new AutoFilter({
                        frequency: f.frequency,
                        depth: f.depth,
                        baseFrequency: f.baseFrequency,
                        octaves: f.octaves,
                        filter: f.filter,
                        wet: f.wet,
                        type: f.type,
                    }),
                );
                break;
            case "BiquadFilterFilter":
                res.push(
                    new BiquadFilter({
                        frequency: f.frequency,
                        detune: f.detune,
                        Q: f.Q,
                        type: f.type,
                        gain: f.gain,
                    }),
                );
                break;
            case "OnePoleFilterFilter":
                res.push(
                    new OnePoleFilter({
                        frequency: f.frequency,
                        type: f.type,
                    }),
                );
                break;
            case "CustomFilter":
                res.push(
                    new Filter({
                        frequency: f.frequency,
                        Q: f.Q,
                        type: f.type,
                        detune: f.detune,
                        gain: f.gain,
                        rolloff: f.rolloff,
                    }),
                );
                break;
            case "ChorusFilter":
                res.push(
                    new Chorus({
                        frequency: f.frequency,
                        delayTime: f.delayTime,
                        depth: f.depth,
                        type: f.type,
                        spread: f.spread,
                        feedback: f.feedback,
                        wet: f.wet,
                    }),
                );
                break;
            case "TremoloFilter":
                res.push(
                    new Tremolo({
                        frequency: f.frequency,
                        type: f.type,
                        depth: f.depth,
                        spread: f.spread,
                        wet: f.wet,
                    }),
                );
                break;
            case "VibratoFilter":
                res.push(
                    new Vibrato({
                        maxDelay: f.maxDelay,
                        frequency: f.frequency,
                        depth: f.depth,
                        type: f.type,
                        wet: f.wet,
                    }),
                );
                break;
            case "AutoPannerFilter":
                res.push(
                    new AutoPanner({
                        frequency: f.frequency,
                        type: f.type,
                        depth: f.depth,
                        channelCount: f.channelCount,
                        wet: f.wet,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return filter.reduce((res: SoundFilterMemory[], f) => {
        if (f instanceof Reverb) {
            res.push({
                filterType: "ReverbFilter",
                wet: f.wet.value,
                decay: Time(f.decay).toSeconds(),
                preDelay: Time(f.preDelay).toSeconds(),
            });
        } else if (f instanceof PingPongDelay) {
            // Check PingPongDelay before FeedbackDelay (both share feedback/delayTime)
            res.push({
                filterType: "PingPongDelayFilter",
                wet: f.wet.value,
                delayTime: f.delayTime.value,
                feedback: f.feedback.value,
                // maxDelay: f.maxDelay,
            });
        } else if (f instanceof FeedbackDelay) {
            res.push({
                filterType: "FeedbackDelayFilter",
                feedback: f.feedback.value,
                delayTime: f.delayTime.value,
                wet: f.wet.value,
            });
        } else if (f instanceof BitCrusher) {
            res.push({
                filterType: "BitCrusherFilter",
                bits: f.bits.value,
                wet: f.wet.value,
            });
        } else if (f instanceof Compressor) {
            res.push({
                filterType: "CompressorFilter",
                attack: f.attack.value,
                knee: f.knee.value,
                ratio: f.ratio.value,
                release: f.release.value,
                threshold: f.threshold.value,
            });
        } else if (f instanceof Delay) {
            res.push({
                filterType: "DelayFilter",
                delayTime: f.delayTime.value,
                maxDelay: f.maxDelay,
            });
        } else if (f instanceof Distortion) {
            res.push({
                filterType: "DistortionFilter",
                distortion: f.distortion,
                oversample: f.oversample,
                wet: f.wet.value,
            });
        } else if (f instanceof FeedbackCombFilter) {
            res.push({
                filterType: "FeedbackCombFilterFilter",
                delayTime: f.delayTime.value,
                resonance: f.resonance.value,
            });
        } else if (f instanceof Freeverb) {
            res.push({
                filterType: "FreeverbFilter",
                roomSize: f.roomSize.value,
                dampening: f.dampening,
                wet: f.wet.value,
            });
        } else if (f instanceof Gate) {
            res.push({
                filterType: "GateFilter",
                threshold: f.threshold,
                smoothing: f.smoothing,
            });
        } else if (f instanceof GreaterThan) {
            res.push({
                filterType: "GreaterThanFilter",
                value: f.comparator.value,
                convert: f.convert,
                maxValue: f.maxValue,
                minValue: f.minValue,
                // units: f.units,
            });
        } else if (f instanceof GreaterThanZero) {
            res.push({ filterType: "GreaterThanZeroFilter" });
        } else if (f instanceof Limiter) {
            res.push({
                filterType: "LimiterFilter",
                threshold: f.threshold.value,
            });
        } else if (f instanceof MidSideCompressor) {
            res.push({
                filterType: "MidSideCompressorFilter",
                mid: {
                    attack: f.mid.attack.value,
                    knee: f.mid.knee.value,
                    ratio: f.mid.ratio.value,
                    release: f.mid.release.value,
                    threshold: f.mid.threshold.value,
                },
                side: {
                    attack: f.side.attack.value,
                    knee: f.side.knee.value,
                    ratio: f.side.ratio.value,
                    release: f.side.release.value,
                    threshold: f.side.threshold.value,
                },
            });
        } else if (f instanceof MultibandCompressor) {
            res.push({
                filterType: "MultibandCompressorFilter",
                lowFrequency: f.lowFrequency.value,
                highFrequency: f.highFrequency.value,
                low: {
                    attack: f.low.attack.value,
                    knee: f.low.knee.value,
                    ratio: f.low.ratio.value,
                    release: f.low.release.value,
                    threshold: f.low.threshold.value,
                },
                mid: {
                    attack: f.mid.attack.value,
                    knee: f.mid.knee.value,
                    ratio: f.mid.ratio.value,
                    release: f.mid.release.value,
                    threshold: f.mid.threshold.value,
                },
                high: {
                    attack: f.high.attack.value,
                    knee: f.high.knee.value,
                    ratio: f.high.ratio.value,
                    release: f.high.release.value,
                    threshold: f.high.threshold.value,
                },
            });
        } else if (f instanceof Panner3D) {
            res.push({
                filterType: "Panner3DFilter",
                positionX: f.positionX.value,
                positionY: f.positionY.value,
                positionZ: f.positionZ.value,
                orientationX: f.orientationX.value,
                orientationY: f.orientationY.value,
                orientationZ: f.orientationZ.value,
                coneInnerAngle: f.coneInnerAngle,
                coneOuterAngle: f.coneOuterAngle,
                coneOuterGain: f.coneOuterGain,
                distanceModel: f.distanceModel,
                maxDistance: f.maxDistance,
                refDistance: f.refDistance,
                rolloffFactor: f.rolloffFactor,
                panningModel: f.panningModel,
            });
        } else if (f instanceof Phaser) {
            res.push({
                filterType: "PhaserFilter",
                frequency: f.frequency.value,
                octaves: f.octaves,
                baseFrequency: f.baseFrequency,
                wet: f.wet.value,
                Q: f.Q.value,
                // stages: f.stages,
            });
        } else if (f instanceof StereoWidener) {
            res.push({
                filterType: "StereoWidenerFilter",
                width: f.width.value,
                wet: f.wet.value,
            });
        } else if (f instanceof AutoFilter) {
            res.push({
                filterType: "AutoFilterFilter",
                type: f.type,
                frequency: f.frequency.value,
                depth: f.depth.value,
                baseFrequency: f.baseFrequency,
                octaves: f.octaves,
                filter: {
                    Q: f.filter.Q.value,
                    type: f.filter.type,
                    rolloff: f.filter.rolloff,
                },
                wet: f.wet.value,
            });
        } else if (f instanceof Chorus) {
            res.push({
                filterType: "ChorusFilter",
                type: f.type,
                frequency: f.frequency.value,
                delayTime: f.delayTime,
                depth: f.depth,
                spread: f.spread,
                feedback: f.feedback.value,
                wet: f.wet.value,
            });
        } else if (f instanceof Tremolo) {
            res.push({
                filterType: "TremoloFilter",
                type: f.type,
                frequency: f.frequency.value,
                depth: f.depth.value,
                spread: f.spread,
                wet: f.wet.value,
            });
        } else if (f instanceof Vibrato) {
            res.push({
                filterType: "VibratoFilter",
                type: f.type,
                frequency: f.frequency.value,
                depth: f.depth.value,
                // maxDelay: f.maxDelay,
                wet: f.wet.value,
            });
        } else if (f instanceof AutoPanner) {
            res.push({
                filterType: "AutoPannerFilter",
                type: f.type,
                frequency: f.frequency.value,
                depth: f.depth.value,
                channelCount: f.channelCount,
                wet: f.wet.value,
            });
        } else if (f instanceof BiquadFilter) {
            res.push({
                filterType: "BiquadFilterFilter",
                type: f.type,
                frequency: f.frequency.value,
                detune: f.detune.value,
                Q: f.Q.value,
                gain: f.gain.value,
            });
        } else if (f instanceof OnePoleFilter) {
            res.push({
                filterType: "OnePoleFilterFilter",
                type: f.type,
                frequency: f.frequency,
            });
        } else if (f instanceof Filter) {
            res.push({
                filterType: "CustomFilter",
                type: f.type,
                frequency: f.frequency.value,
                Q: f.Q.value,
                detune: f.detune.value,
                gain: f.gain.value,
                rolloff: f.rolloff,
            });
        } else {
            logger.warn(
                `Unsupported filter type for serialisation: ${f?.constructor?.name ?? f}, please report this to the developers if you encounter it.`,
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
