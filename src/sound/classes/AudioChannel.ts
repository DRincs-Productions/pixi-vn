import { sound } from "@pixi/sound";
import { calculateVolume } from "../functions/channel-utility";
import { proxyMedia } from "../functions/proxy-utility";
import AudioChannelInterface from "../interfaces/AudioChannelInterface";
import IMediaInstance from "../interfaces/IMediaInstance";
import { ChannelOptions, SoundPlayOptions } from "../interfaces/SoundOptions";

export default class AudioChannel implements AudioChannelInterface {
    constructor(
        readonly alias: string,
        readonly channelOptions: ChannelOptions = {},
    ) {}
    readonly mediaInstances: {
        [key: string]: {
            instance: IMediaInstance;
            options: SoundPlayOptions;
        };
    } = {};
    async play(alias: string, options?: SoundPlayOptions): Promise<IMediaInstance> {
        const media = proxyMedia(
            await sound.play(alias, {
                filters: [...(this.channelOptions.filters || []), ...(options?.filters || [])],
                muted: this.channelOptions.muted ?? options?.muted,
                volume: calculateVolume(options?.volume, this.channelOptions.volume),
            }),
            this,
        );
        media.on("end", () => {
            delete this.mediaInstances[media.id];
        });
        return media;
    }
}
