import { GameUnifier } from "@drincs/pixi-vn/core";
import type SoundManagerInterface from "@sound/interfaces/SoundManagerInterface";
import SoundManager from "@sound/SoundManager";
import SoundRegistry from "@sound/SoundRegistry";

export type { default as AudioChannelInterface } from "@sound/interfaces/AudioChannelInterface";
export type { default as IMediaInstance } from "@sound/interfaces/MediaInteface";
export type {
    ExportedSound,
    ExportedSoundPlay,
    default as SoundGameState,
    SoundPlay,
} from "@sound/interfaces/SoundGameState";
export type {
    ChannelOptions,
    default as SoundOptions,
    SoundPlayOptions,
    SoundPlayOptionsWithChannel,
} from "@sound/interfaces/SoundOptions";
export { default as SoundRegistry } from "@sound/SoundRegistry";

/**
 * The singleton sound manager instance. Use this to play and manage sounds in your game.
 */
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
        if (document.hidden) {
            if (!sound.muted) {
                sound.muteAll();
                _autoMuted = true;
            }
        } else if (_autoMuted) {
            sound.unmuteAll();
            _autoMuted = false;
        }
    });
}

export { sound };
