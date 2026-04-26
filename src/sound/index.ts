import { GameUnifier } from "@drincs/pixi-vn/core";
import type SoundManagerInterface from "./interfaces/SoundManagerInterface";
import SoundManager from "./SoundManager";
import SoundRegistry from "./SoundRegistry";
import { getDestination } from "tone";

export type { default as AudioChannelInterface } from "./interfaces/AudioChannelInterface";
export type { default as IMediaInstance } from "./interfaces/MediaInteface";
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
export { default as SoundRegistry } from "./SoundRegistry";
export type { default as SoundFilterMemory } from "./types/SoundFilterMemory";

const sound: SoundManagerInterface = new SoundManager();

GameUnifier.addOnPreContinue(async () => {
    try {
        SoundRegistry.channels.forEach((channel) => {
            if (!channel.background) {
                channel.stopAll();
            }
        });
    } catch (_e) {}
});

// Auto-mute when the browser tab is hidden (minimised, covered by another
// window, or the user has switched to a different tab) and restore the
// previous mute state when the tab becomes visible again.  We only unmute
// if *we* were the ones who muted it, so an explicit `sound.muteAll()` call
// made before hiding the tab is not accidentally reversed.
if (typeof document !== "undefined") {
    let _autoMuted = false;
    document.addEventListener("visibilitychange", () => {
        const destination = getDestination();
        if (document.hidden) {
            if (!destination.mute) {
                destination.mute = true;
                _autoMuted = true;
            }
        } else if (_autoMuted) {
            destination.mute = false;
            _autoMuted = false;
        }
    });
}

export { sound };
