import { GameUnifier } from "@drincs/pixi-vn/core";
import { sound } from "@pixi/sound";
import { calculateVolume } from "@sound/functions/channel-utility";
import { proxyMedia } from "@sound/functions/proxy-utility";
import type AudioChannelInterface from "@sound/interfaces/AudioChannelInterface";
import type IMediaInstance from "@sound/interfaces/IMediaInstance";
import type { ChannelOptions, SoundPlayOptions } from "@sound/interfaces/SoundOptions";
import SoundManagerStatic from "@sound/SoundManagerStatic";

export default class AudioChannel implements AudioChannelInterface {
    constructor(
        readonly alias: string,
        readonly channelOptions: ChannelOptions = {},
    ) {}
    private readonly _transientInstances: Set<IMediaInstance> = new Set();
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
        const media = proxyMedia(
            mediaAlias,
            await sound.play(soundAlias, {
                ...(rest ?? {}),
                filters: [...(this.channelOptions.filters || []), ...(rest?.filters || [])],
                muted: Boolean(this.channelOptions.muted) || Boolean(rest?.muted),
                volume: calculateVolume(rest?.volume, this.channelOptions.volume),
            }),
            this,
        );
        media.paused = effectivePaused;
        if (options?.delay) {
            media.paused = true;
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
        const media = await sound.play(soundAlias, {
            ...rest,
            filters: [...(this.channelOptions.filters || []), ...(rest?.filters || [])],
            muted: Boolean(this.channelOptions.muted) || Boolean(rest?.muted),
            volume: calculateVolume(rest?.volume, this.channelOptions.volume),
        });
        const pausedState = Boolean(paused) || Boolean(this.channelOptions.paused);
        media.paused = pausedState;
        let delayTimeout: ReturnType<typeof setTimeout> | undefined;
        if (options?.delay) {
            media.paused = true;
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
                // Apply only the per-media muted state; the proxy is responsible for
                // enforcing channel-level muting without overwriting per-media options.
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
    pauseUnsavedAll(): this {
        this.channelOptions.paused = true;
        this.updateMediaPaused();
        return this;
    }
    resumeUnsavedAll(): this {
        this.channelOptions.paused = false;
        this.updateMediaPaused();
        return this;
    }
}
