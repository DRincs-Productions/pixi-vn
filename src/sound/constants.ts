/**
 * Sound filter stubs – Tone.js effect implementations are a work-in-progress.
 * The objects below follow the same shape as the old `@pixi/sound` filter
 * constructors so that existing code referencing `filters.XxxFilter` does not
 * break at the type level.
 *
 * TODO: replace each entry with a real Tone.js–based effect class.
 */
export const filters = {
    DistortionFilter: class DistortionFilter {
        readonly filterType = "DistortionFilter";
        constructor(public amount?: number) {}
    },
    EqualizerFilter: class EqualizerFilter {
        readonly filterType = "EqualizerFilter";
        constructor(
            public f32?: number,
            public f64?: number,
            public f125?: number,
            public f250?: number,
            public f500?: number,
            public f1k?: number,
            public f2k?: number,
            public f4k?: number,
            public f8k?: number,
            public f16k?: number,
        ) {}
    },
    MonoFilter: class MonoFilter {
        readonly filterType = "MonoFilter";
    },
    ReverbFilter: class ReverbFilter {
        readonly filterType = "ReverbFilter";
        constructor(
            public seconds?: number,
            public decay?: number,
            public reverse?: boolean,
        ) {}
    },
    StereoFilter: class StereoFilter {
        readonly filterType = "StereoFilter";
        constructor(public pan?: number) {}
    },
    StreamFilter: class StreamFilter {
        readonly filterType = "StreamFilter";
    },
    TelephoneFilter: class TelephoneFilter {
        readonly filterType = "TelephoneFilter";
    },
} as const;
