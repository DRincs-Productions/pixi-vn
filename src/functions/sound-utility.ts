import { Filter, filters } from "@pixi/sound";
import { SoundFilterMemory } from "../types";

export function FilterMemoryToFilter(filter: SoundFilterMemory[]): Filter[] {
    let res: Filter[] = []
    for (let f of filter) {
        if (f.type === "TelephoneFilter") {
            res.push(new filters.TelephoneFilter())
        }
        else if (f.type === "StreamFilter") {
            res.push(new filters.StreamFilter())
        }
        else if (f.type === "StereoFilter") {
            res.push(new filters.StereoFilter(f.pan))
        }
        else if (f.type === "ReverbFilter") {
            res.push(new filters.ReverbFilter(f.seconds, f.decay, f.reverse))
        }
        else if (f.type === "MonoFilter") {
            res.push(new filters.MonoFilter())
        }
        else if (f.type === "EqualizerFilter") {
            res.push(new filters.EqualizerFilter(f.f32, f.f64, f.f125, f.f250, f.f500, f.f1k, f.f2k, f.f4k, f.f8k, f.f16k))
        }
        else if (f.type === "DistortionFilter") {
            res.push(new filters.DistortionFilter(f.amount))
        }
        else {
            console.error("[Pixi’VN] Unknown sound filter type")
        }
    }
    return res
}

export function FilterToFilterMemory(filter?: Filter[]): SoundFilterMemory[] | undefined {
    if (!filter) return undefined
    let res: SoundFilterMemory[] = []
    for (let f of filter) {
        if (f instanceof filters.TelephoneFilter) {
            res.push({
                type: "TelephoneFilter"
            })
        }
        else if (f instanceof filters.StreamFilter) {
            res.push({
                type: "StreamFilter"
            })
        }
        else if (f instanceof filters.StereoFilter) {
            res.push({
                type: "StereoFilter",
                pan: f.pan
            })
        }
        else if (f instanceof filters.ReverbFilter) {
            res.push({
                type: "ReverbFilter",
                seconds: f.seconds,
                decay: f.decay,
                reverse: f.reverse
            })
        }
        else if (f instanceof filters.MonoFilter) {
            res.push({
                type: "MonoFilter"
            })
        }
        else if (f instanceof filters.EqualizerFilter) {
            res.push({
                type: "EqualizerFilter",
                f32: f.f32,
                f64: f.f64,
                f125: f.f125,
                f250: f.f250,
                f500: f.f500,
                f1k: f.f1k,
                f2k: f.f2k,
                f4k: f.f4k,
                f8k: f.f8k,
                f16k: f.f16k
            })
        }
        else if (f instanceof filters.DistortionFilter) {
            res.push({
                type: "DistortionFilter",
                amount: f.amount
            })
        }
        else {
            console.error("[Pixi’VN] Unknown sound filter type")
        }
    }
    return res
}