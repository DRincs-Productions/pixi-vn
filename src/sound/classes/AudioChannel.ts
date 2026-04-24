import * as Tone from "tone";
import { GameUnifier } from "@drincs/pixi-vn/core";
import ToneMediaInstance from "@sound/classes/ToneMediaInstance";
import { proxyMedia } from "@sound/functions/proxy-utility";
import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type IMediaInstance from "@sound/interfaces/IMediaInstance";
import type { ChannelOptions, SoundPlayOptions } from "@sound/interfaces/SoundOptions";
import SoundManagerStatic from "@sound/SoundManagerStatic";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a linear [0, 1] gain value to decibels. */
function linearToDecibels(v: number): number {
    return v <= 0 ? -Infinity : 20 * Math.log10(v);
}

/** Convert a decibel value to a linear [0, 1] gain. */
function decibelsToLinear(db: number): number {
    return db <= -Infinity ? 0 : Math.pow(10, db / 20);
}

// ---------------------------------------------------------------------------
// Type-erasure base
//
// Tone.Channel declares `volume` and `pan` as `readonly Param<...>` instance
// properties, and `muted` as a readonly prototype getter.  These types are
// incompatible with our AudioChannelInterface (which uses plain numbers and a
// writable `muted`).  We cast the constructor to a version that omits those
// three properties so TypeScript lets us redeclare them below.
// ---------------------------------------------------------------------------

const _ToneChannelBase = Tone.Channel as unknown as new (
    ...args: unknown[]
) => Omit<Tone.Channel, "volume" | "pan" | "muted">;

// ---------------------------------------------------------------------------
// AudioChannel
// ---------------------------------------------------------------------------

export default class AudioChannel extends _ToneChannelBase implements AudioChannelInterface {
    readonly alias: string;

    /**
     * Reference to Tone.Channel's `volume` Param captured during construction
     * (before we remove the own-instance property so our prototype getter takes
     * over).
     */
    private readonly _toneVolume: { value: number };

    /**
     * Reference to Tone.Channel's `pan` Param captured during construction.
     */
    private readonly _tonePan: { value: number };

    /** Per-channel state for concepts not modelled by Tone.Channel (paused, background, filters). */
    private readonly _channelState: Pick<ChannelOptions, "paused" | "background" | "filters">;

    private readonly _transientInstances: Set<ToneMediaInstance> = new Set();

    constructor(alias: string, channelOptions: ChannelOptions = {}) {
        // Initialise Tone.Channel with dB volume, mute, and pan.
        // Some host environments (e.g. jsdom test mocks) ignore these args, so
        // we explicitly set the params afterwards as well.
        super({ volume: linearToDecibels(channelOptions.volume ?? 1), mute: channelOptions.muted ?? false, pan: channelOptions.pan ?? 0 });

        this.alias = alias;
        this._channelState = {
            paused: channelOptions.paused,
            background: channelOptions.background,
            filters: channelOptions.filters,
        };

        // After super() the parent assigns `this.volume` and `this.pan` as own
        // instance data-properties (via Tone's `readOnly()` helper which sets
        // `writable:false` but keeps `configurable:true`).  We capture these
        // Param references before redefining the properties.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._toneVolume = (this as any).volume as { value: number };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._tonePan = (this as any).pan as { value: number };

        // Remove the own properties so our prototype getter/setter definitions
        // (below) are reached by the JavaScript property-lookup chain.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (this as any).volume;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (this as any).pan;

        // Apply the requested initial values (handles mocks that ignore super() args).
        this._toneVolume.value = linearToDecibels(channelOptions.volume ?? 1);
        this._tonePan.value = channelOptions.pan ?? 0;
        this.mute = channelOptions.muted ?? false;

        // Route this channel's output to the global audio destination.
        this.toDestination();
    }

    // ------------------------------------------------------------------ //
    // volume — linear [0, 1] façade over Tone.Channel's dB Param          //
    // ------------------------------------------------------------------ //

    get volume(): number {
        return decibelsToLinear(this._toneVolume.value);
    }
    set volume(v: number) {
        if (this._toneVolume !== undefined) {
            // Normal use: convert linear → dB and store in the Tone Param.
            this._toneVolume.value = linearToDecibels(v);
        } else {
            // Called from super() during construction with a Tone.Param object.
            // Store it as a configurable own property so Tone's readOnly() call
            // (which sets writable:false) does not permanently lock it
            // (configurable:true allows us to delete it after super() returns).
            Object.defineProperty(this, "volume", {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value: v as any,
                writable: true,
                configurable: true,
                enumerable: true,
            });
        }
    }

    // ------------------------------------------------------------------ //
    // pan — plain number [-1, 1] façade over Tone.Channel's audioRange Param //
    // ------------------------------------------------------------------ //

    get pan(): number {
        return this._tonePan.value;
    }
    set pan(v: number) {
        if (this._tonePan !== undefined) {
            // Normal use.
            this._tonePan.value = v;
        } else {
            // Called from super() with a Tone.Param object — see set volume() above.
            Object.defineProperty(this, "pan", {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value: v as any,
                writable: true,
                configurable: true,
                enumerable: true,
            });
        }
    }

    // ------------------------------------------------------------------ //
    // muted — read/write, delegating to Tone.Channel's mute setter        //
    // ------------------------------------------------------------------ //

    get muted(): boolean {
        return this.mute;
    }
    set muted(v: boolean) {
        this.mute = v;
    }

    // ------------------------------------------------------------------ //
    // paused — no Tone.Channel equivalent; managed internally             //
    // ------------------------------------------------------------------ //

    get paused(): boolean {
        return this._channelState.paused ?? false;
    }
    set paused(value: boolean) {
        this._channelState.paused = value;
        this._updateMediaPaused();
    }

    // ------------------------------------------------------------------ //
    // background                                                          //
    // ------------------------------------------------------------------ //

    get background(): boolean {
        return this._channelState.background ?? false;
    }

    // ------------------------------------------------------------------ //
    // Private helpers                                                     //
    // ------------------------------------------------------------------ //

    private _createPlayer(soundAlias: string, options: SoundPlayOptions): Tone.Player {
        const buffer = SoundManagerStatic.bufferRegistry.get(soundAlias);
        if (!buffer) {
            throw new Error(
                `Sound buffer for alias "${soundAlias}" is not loaded. Call sound.load() first.`,
            );
        }
        // Connect the player INTO this channel (not directly to the destination).
        // Tone.Channel applies its own volume and pan on top of the player's output.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const player = new Tone.Player(buffer).connect(this as any);
        player.loop = options.loop ?? false;
        player.playbackRate = options.speed ?? 1;
        // Per-media mute only — channel-level muting is handled by Tone.Channel.
        player.mute = Boolean(options.muted);
        // Per-media volume (linear → dB).  Channel volume is applied by the audio graph.
        player.volume.value = linearToDecibels(options.volume ?? 1);
        return player;
    }

    async play(alias: string, options?: SoundPlayOptions): Promise<IMediaInstance>;
    async play(
        mediaAlias: string,
        soundAlias: string,
        options?: SoundPlayOptions,
    ): Promise<IMediaInstance>;
    async play(
        aliasOrMediaAlias: string,
        soundAliasOrOptions?: string | SoundPlayOptions,
        options?: SoundPlayOptions,
    ): Promise<IMediaInstance> {
        let mediaAlias: string;
        let soundAlias: string;
        if (typeof soundAliasOrOptions === "string") {
            mediaAlias = aliasOrMediaAlias;
            soundAlias = soundAliasOrOptions;
        } else {
            mediaAlias = aliasOrMediaAlias;
            soundAlias = aliasOrMediaAlias;
            options = soundAliasOrOptions;
        }

        if (SoundManagerStatic.mediaInstances.has(mediaAlias)) {
            const oldMedia = SoundManagerStatic.mediaInstances.get(mediaAlias);
            if (oldMedia) {
                oldMedia.instance.stop();
                options = {
                    ...oldMedia.options,
                    ...options,
                };
            }
        }

        const { paused, ...rest } = options || {};
        const effectivePaused = Boolean(this.paused) || Boolean(paused);

        const player = this._createPlayer(soundAlias, rest);
        const toneMedia = new ToneMediaInstance(player, !effectivePaused);
        const media = proxyMedia(mediaAlias, toneMedia, this);

        if (options?.delay) {
            if (!effectivePaused) {
                // Pause immediately so the sound is heard only after the delay.
                toneMedia.pauseImmediate();
            }
            const timeoutId = setTimeout(() => {
                media.paused = effectivePaused;
                SoundManagerStatic.delayTimeoutInstances =
                    SoundManagerStatic.delayTimeoutInstances.filter(
                        (item) => item[0] !== timeoutId,
                    );
            }, options.delay * 1000);
            SoundManagerStatic.delayTimeoutInstances.push([timeoutId, mediaAlias]);
        }

        SoundManagerStatic.mediaInstances.set(mediaAlias, {
            channelAlias: this.alias,
            soundAlias: soundAlias,
            instance: media,
            stepCounter: GameUnifier.stepCounter,
            options: {
                volume: options?.volume ?? 1,
                muted: options?.muted ?? false,
                loop: options?.loop ?? false,
                ...(options ?? {}),
                paused: effectivePaused,
            },
        });
        media.on("end", () => {
            SoundManagerStatic.mediaInstances.delete(mediaAlias);
        });
        return media;
    }

    async playTransient(soundAlias: string, options?: SoundPlayOptions): Promise<IMediaInstance> {
        const { paused, ...rest } = options || {};
        const pausedState = Boolean(paused) || Boolean(this.paused);

        const player = this._createPlayer(soundAlias, rest);
        const media = new ToneMediaInstance(player, !pausedState);

        let delayTimeout: ReturnType<typeof setTimeout> | undefined;
        if (options?.delay) {
            if (!pausedState) {
                // Pause immediately so the sound is heard only after the delay.
                media.pauseImmediate();
            }
            delayTimeout = setTimeout(() => {
                media.paused = pausedState;
                delayTimeout = undefined;
            }, options.delay * 1000);
        }

        this._transientInstances.add(media);
        media.on("end", () => {
            if (delayTimeout !== undefined) {
                clearTimeout(delayTimeout);
                delayTimeout = undefined;
            }
            this._transientInstances.delete(media);
        });
        return media;
    }

    stopTransientAll(): this {
        for (const media of this._transientInstances) {
            media.stop();
        }
        this._transientInstances.clear();
        return this;
    }

    toggleMuteAll(): boolean {
        this.muted = !this.muted;
        return this.muted;
    }

    get mediaInstances(): IMediaInstance[] {
        return Array.from(SoundManagerStatic.mediaInstances.values()).reduce(
            (instances: IMediaInstance[], mediaInstance) => {
                if (mediaInstance.channelAlias === this.alias) {
                    instances.push(mediaInstance.instance);
                }
                return instances;
            },
            [],
        );
    }

    stopAll() {
        const aliasesToDelete: string[] = [];
        for (const [mediaAlias, mediaInstance] of SoundManagerStatic.mediaInstances.entries()) {
            if (mediaInstance.channelAlias === this.alias) {
                mediaInstance.instance.stop();
                aliasesToDelete.push(mediaAlias);
            }
        }
        aliasesToDelete.forEach((mediaAlias) => {
            SoundManagerStatic.mediaInstances.delete(mediaAlias);
        });
        return this;
    }

    pauseAll(): this {
        for (const mediaInstance of SoundManagerStatic.mediaInstances.values()) {
            if (mediaInstance.channelAlias === this.alias && !mediaInstance.instance.paused) {
                mediaInstance.instance.paused = true;
            }
        }
        return this;
    }

    resumeAll(): this {
        for (const mediaInstance of SoundManagerStatic.mediaInstances.values()) {
            if (mediaInstance.channelAlias === this.alias && mediaInstance.instance.paused) {
                mediaInstance.instance.paused = false;
            }
        }
        return this;
    }

    private _updateMediaPaused() {
        for (const mediaInstance of SoundManagerStatic.mediaInstances.values()) {
            if (mediaInstance.channelAlias === this.alias) {
                const mediaPaused = mediaInstance.options.paused ?? false;
                mediaInstance.instance.paused = mediaPaused;
            }
        }
    }

    pauseUnsavedAll(): this {
        this.paused = true;
        return this;
    }

    resumeUnsavedAll(): this {
        this.paused = false;
        return this;
    }
}
