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
            const entry = SoundManagerStatic.mediaInstances.get(mediaAlias);
            if (entry) {
                switch (prop) {
                    case "volume":
                        entry.options[prop] = value;
                        value = calculateVolume(value, channel.channelOptions.volume);
                        return Reflect.set(target, prop, value, receiver);
                    case "muted":
                        entry.options[prop] = value;
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
                        entry.options[prop] = value;
                    default:
                        return Reflect.set(target, prop, value, receiver);
                }
            }
            return Reflect.set(target, prop, value, receiver);
        },
    });
}
