import SoundManagerStatic from "../SoundManagerStatic";
import type AudioChannel from "../classes/AudioChannel";
import { calculateVolume } from "./channel-utility";
import type IMediaInstance from "../interfaces/IMediaInstance";

export function proxyMedia(
    mediaAlias: string,
    media: IMediaInstance,
    channel: AudioChannel,
): IMediaInstance {
    return new Proxy(media, {
        get(target, prop, receiver) {
            switch (prop) {
                case "volume":
                case "paused":
                case "muted": {
                    const entry = SoundManagerStatic.mediaInstances.get(mediaAlias);
                    if (entry) {
                        return entry.options[prop as keyof typeof entry.options];
                    }
                    return Reflect.get(target, prop, receiver);
                }
                default:
                    return Reflect.get(target, prop, receiver);
            }
        },
        set(target, prop, value, receiver) {
            const mediaEntry = SoundManagerStatic.mediaInstances.get(mediaAlias);
            if (mediaEntry) {
                let targetValue = value;
                switch (prop) {
                    case "volume":
                        mediaEntry.options[prop] = value;
                        targetValue = calculateVolume(value, channel.channelOptions.volume);
                        break;
                    case "muted":
                        mediaEntry.options[prop] = value;
                        if (channel.channelOptions.muted) {
                            targetValue = true;
                        }
                        break;
                    case "paused":
                        mediaEntry.options[prop] = value;
                        if (channel.channelOptions.paused) {
                            targetValue = true;
                        }
                        break;
                    case "loop":
                    case "delay":
                    case "end":
                    case "filters":
                    case "singleInstance":
                    case "speed":
                    case "sprite":
                    case "start":
                        mediaEntry.options[prop] = value;
                        break;
                    default:
                        break;
                }
                return Reflect.set(target, prop, targetValue, receiver);
            }
            return Reflect.set(target, prop, value, receiver);
        },
    });
}
