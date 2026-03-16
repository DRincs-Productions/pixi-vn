import { sound } from "@pixi/sound";
import { calculateVolume } from "../functions/channel-utility";
import { proxyMedia } from "../functions/proxy-utility";
import AudioChannelInterface from "../interfaces/AudioChannelInterface";
import IMediaInstance from "../interfaces/IMediaInstance";
import { ChannelOptions, SoundPlayOptions } from "../interfaces/SoundOptions";
import SoundManagerStatic from "../SoundManagerStatic";

export default class AudioChannel implements AudioChannelInterface {
    constructor(
        readonly alias: string,
        readonly channelOptions: ChannelOptions = {},
    ) {}
    async play(alias: string, options?: SoundPlayOptions): Promise<IMediaInstance> {
        const media = proxyMedia(
            await sound.play(alias, {
                ...(options || {}),
                filters: [...(this.channelOptions.filters || []), ...(options?.filters || [])],
                muted: this.channelOptions.muted ?? options?.muted,
                volume: calculateVolume(options?.volume, this.channelOptions.volume),
            }),
            this,
        );
        SoundManagerStatic.mediaInstances[media.id] = {
            channelAlias: this.alias,
            instance: media,
            options: {
                volume: options?.volume || 1,
                muted: options?.muted || false,
                loop: options?.loop || false,
                ...(options || {}),
            },
        };
        media.on("end", () => {
            delete SoundManagerStatic.mediaInstances[media.id];
        });
        return media;
    }
    private updateMediaVolume() {
        for (const mediaId in SoundManagerStatic.mediaInstances) {
            const mediaInstance = SoundManagerStatic.mediaInstances[mediaId];
            if (mediaInstance.channelAlias === this.alias) {
                mediaInstance.instance.volume = mediaInstance.options.volume || 1;
            }
        }
    }
    get volume(): number {
        return this.channelOptions.volume || 1;
    }
    set volume(value: number) {
        this.channelOptions.volume = value;
        this.updateMediaVolume();
    }
    private updateMediaMuted() {
        for (const mediaId in SoundManagerStatic.mediaInstances) {
            const mediaInstance = SoundManagerStatic.mediaInstances[mediaId];
            if (mediaInstance.channelAlias === this.alias) {
                mediaInstance.instance.muted = mediaInstance.options.muted || false;
            }
        }
    }
    get muted(): boolean {
        return this.channelOptions.muted || false;
    }
    set muted(value: boolean) {
        this.channelOptions.muted = value;
        this.updateMediaMuted();
    }
}
