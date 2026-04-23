import * as Tone from "tone";
import { GameUnifier } from "@drincs/pixi-vn/core";
import ToneMediaInstance from "@sound/classes/ToneMediaInstance";
import { calculateVolume } from "@sound/functions/channel-utility";
import { proxyMedia } from "@sound/functions/proxy-utility";
import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type IMediaInstance from "@sound/interfaces/IMediaInstance";
import type { ChannelOptions, SoundPlayOptions } from "@sound/interfaces/SoundOptions";
import SoundManagerStatic from "@sound/SoundManagerStatic";
import { logger } from "@utils/log-utility";

export default class AudioChannel implements AudioChannelInterface {
    constructor(
        readonly alias: string,
        readonly channelOptions: ChannelOptions = {},
    ) {}
    private readonly _transientInstances: Set<IMediaInstance> = new Set();

    private _createPlayer(soundAlias: string, options: SoundPlayOptions): Tone.Player {
        const buffer = SoundManagerStatic.bufferRegistry.get(soundAlias);
        if (!buffer) {
            throw new Error(
                `Sound buffer for alias "${soundAlias}" is not loaded. Call sound.load() first.`,
            );
        }
        const player = new Tone.Player(buffer).toDestination();
        player.loop = options.loop ?? false;
        player.playbackRate = options.speed ?? 1;
        player.mute = Boolean(this.channelOptions.muted) || Boolean(options.muted);
        const vol = calculateVolume(options.volume, this.channelOptions.volume);
        player.volume.value = vol <= 0 ? -Infinity : 20 * Math.log10(vol);
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
        const effectivePaused = Boolean(this.channelOptions.paused) || Boolean(paused);

        const player = this._createPlayer(soundAlias, rest);
        const toneMedia = new ToneMediaInstance(player, !effectivePaused);
        const media = proxyMedia(mediaAlias, toneMedia, this);

        if (options?.delay) {
            if (!effectivePaused) {
                // Pause immediately and resume after the delay.
                toneMedia["_pausing"] = true;
                player.stop();
                toneMedia["_paused"] = true;
                toneMedia["_startContextTime"] = null;
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
        const pausedState = Boolean(paused) || Boolean(this.channelOptions.paused);

        const player = this._createPlayer(soundAlias, rest);
        const media = new ToneMediaInstance(player, !pausedState) as IMediaInstance;

        let delayTimeout: ReturnType<typeof setTimeout> | undefined;
        if (options?.delay) {
            if (!pausedState) {
                // Pause immediately then resume after the delay.
                (media as ToneMediaInstance)["_pausing"] = true;
                player.stop();
                (media as ToneMediaInstance)["_paused"] = true;
                (media as ToneMediaInstance)["_startContextTime"] = null;
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

    private updateMediaVolume() {
        for (const mediaInstance of SoundManagerStatic.mediaInstances.values()) {
            if (mediaInstance.channelAlias === this.alias) {
                const mediaVolume = mediaInstance.options.volume ?? 1;
                mediaInstance.instance.volume = mediaVolume;
            }
        }
    }

    get volume(): number {
        return this.channelOptions.volume ?? 1;
    }
    set volume(value: number) {
        this.channelOptions.volume = value;
        this.updateMediaVolume();
    }

    private updateMediaMuted() {
        for (const mediaInstance of SoundManagerStatic.mediaInstances.values()) {
            if (mediaInstance.channelAlias === this.alias) {
                const mediaMuted = mediaInstance.options.muted ?? false;
                mediaInstance.instance.muted = mediaMuted;
            }
        }
    }

    get muted(): boolean {
        return this.channelOptions.muted ?? false;
    }
    set muted(value: boolean) {
        this.channelOptions.muted = value;
        this.updateMediaMuted();
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

    get background(): boolean {
        return this.channelOptions.background || false;
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

    private updateMediaPaused() {
        for (const mediaInstance of SoundManagerStatic.mediaInstances.values()) {
            if (mediaInstance.channelAlias === this.alias) {
                const mediaPaused = mediaInstance.options.paused ?? false;
                mediaInstance.instance.paused = mediaPaused;
            }
        }
    }

    get paused(): boolean {
        return this.channelOptions.paused ?? false;
    }
    set paused(value: boolean) {
        this.channelOptions.paused = value;
        this.updateMediaPaused();
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

// Silence unused-variable warning in tests that access private fields via `as any`.
void (logger as unknown);
