import SoundManagerStatic from "../SoundManagerStatic";
import type AudioChannel from "../classes/AudioChannel";
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
                        // Store the per-media volume.  Channel volume is applied
                        // automatically by the Tone.Channel audio graph, so no
                        // multiplication is needed here.
                        mediaEntry.options[prop] = value;
                        break;
                    case "muted":
                        // Store the per-media muted state.  Channel-level muting
                        // is handled by Tone.Channel.mute, so no override needed.
                        mediaEntry.options[prop] = value;
                        break;
                    case "paused":
                        mediaEntry.options[prop] = value;
                        // If the channel itself is paused, keep the player paused
                        // regardless of the per-media request.
                        if (channel.paused) {
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
