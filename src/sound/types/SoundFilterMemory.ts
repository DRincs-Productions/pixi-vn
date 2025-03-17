type DistortionFilter = {
    type: "DistortionFilter",
    amount?: number
}

type EqualizerFilter = {
    type: "EqualizerFilter",
    f32?: number,
    f64?: number,
    f125?: number,
    f250?: number,
    f500?: number,
    f1k?: number,
    f2k?: number,
    f4k?: number,
    f8k?: number,
    f16k?: number
}

type MonoFilter = {
    type: "MonoFilter",
}

type ReverbFilter = {
    type: "ReverbFilter",
    seconds?: number,
    decay?: number,
    reverse?: boolean
}

type StereoFilter = {
    type: "StereoFilter",
    pan?: number
}

type StreamFilter = {
    type: "StreamFilter"
}

type TelephoneFilter = {
    type: "TelephoneFilter"
}

type SoundFilterMemory = DistortionFilter | EqualizerFilter | MonoFilter | ReverbFilter | StereoFilter | StreamFilter | TelephoneFilter
export default SoundFilterMemory
