import { GameUnifier } from "@drincs/pixi-vn/core";
import type SoundManagerInterface from "./interfaces/SoundManagerInterface";
import SoundManager from "./SoundManager";
import SoundManagerStatic from "./SoundManagerStatic";

export { filters } from "./constants";
export type { default as AudioChannelInterface } from "./interfaces/AudioChannelInterface";
export type { default as AudioFilter } from "./interfaces/AudioFilter";
export type { default as IMediaInstance } from "./interfaces/IMediaInstance";
export type {
    ExportedSound,
    ExportedSoundPlay,
    default as SoundGameState,
    SoundPlay,
} from "./interfaces/SoundGameState";
export type {
    ChannelOptions,
    default as SoundOptions,
    SoundPlayOptions,
    SoundPlayOptionsWithChannel,
} from "./interfaces/SoundOptions";
export { default as SoundManagerStatic } from "./SoundManagerStatic";
export type { default as SoundFilterMemory } from "./types/SoundFilterMemory";

const sound: SoundManagerInterface = new SoundManager();

GameUnifier.addOnPreContinue(async () => {
    try {
        SoundManagerStatic.delayTimeoutInstances.forEach((id) => {
            clearTimeout(id[0]);
            const instance = SoundManagerStatic.mediaInstances.get(id[1]);
            if (instance) {
                instance.instance.paused = false;
            }
        });
        SoundManagerStatic.delayTimeoutInstances = [];
        SoundManagerStatic.channels.forEach((channel) => {
            if (!channel.background) {
                channel.stopAll();
            }
        });
    } catch (e) {}
});

export { sound };
