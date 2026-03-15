import { IMediaInstance } from "@pixi/sound";
import SoundManagerStatic from "../SoundManagerStatic";
import type AudioChannel from "../classes/AudioChannel";
import { calculateVolume } from "./channel-utility";

export function proxyMedia(media: IMediaInstance, channel: AudioChannel): IMediaInstance {
    return new Proxy(media, {
        get(target, prop, receiver) {
            switch (prop) {
                case "volume":
                case "muted":
                    return SoundManagerStatic.mediaInstances[target.id].options[prop];
                case "paused":
                default:
                    return Reflect.get(target, prop, receiver);
            }
        },
        set(target, prop, value, receiver) {
            switch (prop) {
                case "volume":
                    SoundManagerStatic.mediaInstances[target.id].options[prop] = value;
                    value = calculateVolume(value, channel.channelOptions.volume);
                    return Reflect.set(target, prop, value, receiver);
                case "muted":
                    SoundManagerStatic.mediaInstances[target.id].options[prop] = value;
                    if (channel.channelOptions.muted) {
                        return Reflect.set(target, prop, true, receiver);
                    } else {
                        return Reflect.set(target, prop, value, receiver);
                    }
                case "loop":
                    SoundManagerStatic.mediaInstances[target.id].options[prop] = value;
                default:
                    return Reflect.set(target, prop, value, receiver);
            }
            return true;
        },
    });
}
