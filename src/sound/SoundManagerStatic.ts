import * as Tone from "tone";
import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type IMediaInstance from "@sound/interfaces/IMediaInstance";
import type { SoundPlayOptions } from "@sound/interfaces/SoundOptions";

export default class SoundManagerStatic {
    private constructor() {}
    static mediaInstances: Map<
        string,
        {
            channelAlias: string;
            soundAlias: string;
            instance: IMediaInstance;
            stepCounter: number;
            options: SoundPlayOptions;
        }
    > = new Map();
    static readonly channels: Map<string, AudioChannelInterface> = new Map();
    static delayTimeoutInstances: [number | NodeJS.Timeout, string][] = [];
    /** Tone.js audio buffers keyed by sound alias. */
    static readonly bufferRegistry: Map<string, Tone.ToneAudioBuffer> = new Map();
    /** Per-alias playback options set via `SoundManager.edit()`. */
    static readonly soundOptions: Map<string, import("@sound/interfaces/SoundOptions").default> =
        new Map();
}
