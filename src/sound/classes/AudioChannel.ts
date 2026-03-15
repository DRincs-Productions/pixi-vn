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
}
