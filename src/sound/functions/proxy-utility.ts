import type { IMediaInstance } from "@pixi/sound";
import SoundManagerStatic from "../SoundManagerStatic";
import type AudioChannel from "../classes/AudioChannel";
import { calculateVolume } from "./channel-utility";

export function proxyMedia(
    mediaAlias: string,
    media: IMediaInstance,
    channel: AudioChannel,
): IMediaInstance {
    return new Proxy(media, {
        get(target, prop, receiver) {
            switch (prop) {
                case "volume":
                case "muted": {
                    const entry = SoundManagerStatic.mediaInstances[mediaAlias];
                    if (entry) {
                        return entry.options[prop as keyof typeof entry.options];
                    }
                    return Reflect.get(target, prop, receiver);
                }
                case "paused":
                default:
                    return Reflect.get(target, prop, receiver);
            }
        },
        set(target, prop, value, receiver) {
            if (mediaAlias in SoundManagerStatic.mediaInstances) {
                switch (prop) {
                    case "volume":
                        SoundManagerStatic.mediaInstances[mediaAlias].options[prop] = value;
                        value = calculateVolume(value, channel.channelOptions.volume);
                        return Reflect.set(target, prop, value, receiver);
                    case "muted":
                        SoundManagerStatic.mediaInstances[mediaAlias].options[prop] = value;
                        if (channel.channelOptions.muted) {
                            return Reflect.set(target, prop, true, receiver);
                        } else {
                            return Reflect.set(target, prop, value, receiver);
                        }
                    case "loop":
                    case "delay":
                    case "end":
                    case "filters":
                    case "singleInstance":
                    case "speed":
                    case "sprite":
                    case "start":
                        SoundManagerStatic.mediaInstances[mediaAlias].options[prop] = value;
                    default:
                        return Reflect.set(target, prop, value, receiver);
                }
            }
            return Reflect.set(target, prop, value, receiver);
        },
    });
}
