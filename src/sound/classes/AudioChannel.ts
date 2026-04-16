import { GameUnifier } from "@drincs/pixi-vn/core";
import { sound } from "@pixi/sound";
import { calculateVolume } from "../functions/channel-utility";
import { proxyMedia } from "../functions/proxy-utility";
import type AudioChannelInterface from "../interfaces/AudioChannelInterface";
import type IMediaInstance from "../interfaces/IMediaInstance";
import type { ChannelOptions, SoundPlayOptions } from "../interfaces/SoundOptions";
import SoundManagerStatic from "../SoundManagerStatic";

export default class AudioChannel implements AudioChannelInterface {
    constructor(
        readonly alias: string,
        readonly channelOptions: ChannelOptions = {},
    ) {}
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
        if (mediaAlias in SoundManagerStatic.mediaInstances) {
            const oldMedia = SoundManagerStatic.mediaInstances[mediaAlias];
            oldMedia.instance.stop();
            options = {
                ...oldMedia.options,
                ...options,
            };
        }
        const media = proxyMedia(
            mediaAlias,
            await sound.play(soundAlias, {
                ...(options ?? {}),
                filters: [...(this.channelOptions.filters || []), ...(options?.filters || [])],
                muted: Boolean(this.channelOptions.muted) || Boolean(options?.muted),
                volume: calculateVolume(options?.volume, this.channelOptions.volume),
            }),
            this,
        );
        if (options?.delay) {
            media.paused = true;
            const timeoutId = setTimeout(() => {
                media.paused = false;
                SoundManagerStatic.delayTimeoutInstances =
                    SoundManagerStatic.delayTimeoutInstances.filter(
                        (item) => item[0] !== timeoutId,
                    );
            }, options.delay * 1000);
            SoundManagerStatic.delayTimeoutInstances.push([timeoutId, mediaAlias]);
        }
        SoundManagerStatic.mediaInstances[mediaAlias] = {
            channelAlias: this.alias,
            soundAlias: soundAlias,
            instance: media,
            stepCounter: GameUnifier.stepCounter(),
            options: {
                volume: options?.volume ?? 1,
                muted: options?.muted ?? false,
                loop: options?.loop ?? false,
                ...(options ?? {}),
            },
        };
        media.on("end", () => {
            delete SoundManagerStatic.mediaInstances[mediaAlias];
        });
        return media;
    }
    private updateMediaVolume() {
        for (const mediaId in SoundManagerStatic.mediaInstances) {
            const mediaInstance = SoundManagerStatic.mediaInstances[mediaId];
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
        for (const mediaId in SoundManagerStatic.mediaInstances) {
            const mediaInstance = SoundManagerStatic.mediaInstances[mediaId];
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
        return Object.values(SoundManagerStatic.mediaInstances).reduce(
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
        for (const mediaAlias in SoundManagerStatic.mediaInstances) {
            const mediaInstance = SoundManagerStatic.mediaInstances[mediaAlias];
            if (mediaInstance.channelAlias === this.alias) {
                mediaInstance.instance.stop();
                delete SoundManagerStatic.mediaInstances[mediaAlias];
            }
        }
        return this;
    }
    pauseAll() {
        for (const mediaId in SoundManagerStatic.mediaInstances) {
            const mediaInstance = SoundManagerStatic.mediaInstances[mediaId];
            if (mediaInstance.channelAlias === this.alias && !mediaInstance.instance.paused) {
                mediaInstance.instance.paused = true;
            }
        }
        return this;
    }
    resumeAll(): this {
        for (const mediaId in SoundManagerStatic.mediaInstances) {
            const mediaInstance = SoundManagerStatic.mediaInstances[mediaId];
            if (mediaInstance.channelAlias === this.alias && mediaInstance.instance.paused) {
                mediaInstance.instance.paused = false;
            }
        }
        return this;
    }
}
