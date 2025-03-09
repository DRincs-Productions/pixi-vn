import { IMediaInstance, Sound as PixiSound } from "@pixi/sound";
import { SoundOptions, SoundPlayOptions } from "../../interface";
import GameUnifier from "../../unifier";
import SoundManagerStatic from "../SoundManagerStatic";

export default class Sound extends PixiSound {
    alias?: string;
    override pause(): this {
        if (!this.alias) {
            throw new Error("[Pixi’VN] The alias is not defined.");
        }
        let item = SoundManagerStatic.soundsPlaying[this.alias];
        if (!item) {
            throw new Error("[Pixi’VN] The alias is not found in the playInStepIndex.");
        }
        SoundManagerStatic.soundsPlaying[this.alias] = {
            ...item,
            paused: true,
        };
        return super.pause();
    }
    override resume(): this {
        if (!this.alias) {
            throw new Error("[Pixi’VN] The alias is not defined.");
        }
        let item = SoundManagerStatic.soundsPlaying[this.alias];
        if (!item) {
            throw new Error("[Pixi’VN] The alias is not found in the playInStepIndex.");
        }
        SoundManagerStatic.soundsPlaying[this.alias] = {
            options: item.options,
            stepIndex: GameUnifier.getLastStepIndex(),
            paused: false,
        };
        return super.resume();
    }
    override destroy(): void {
        if (this.alias) {
            delete SoundManagerStatic.soundsPlaying[this.alias];
        }
        return super.destroy();
    }
    override stop(): this {
        if (!this.alias) {
            throw new Error("[Pixi’VN] The alias is not defined.");
        }
        delete SoundManagerStatic.soundsPlaying[this.alias];
        return super.stop();
    }
    override play(options?: string | SoundPlayOptions): IMediaInstance | Promise<IMediaInstance> {
        if (typeof options === "string") {
            this.alias = options;
        }
        if (!this.alias) {
            throw new Error("[Pixi’VN] The alias is not defined.");
        }
        SoundManagerStatic.soundsPlaying[this.alias] = {
            stepIndex: GameUnifier.getLastStepIndex(),
            options: options,
            paused: false,
        };
        return super.play(options);
    }

    /**
     * https://github.com/pixijs/sound/blob/main/src/Sound.ts#L235
     */
    public static from(source: string | string[] | SoundOptions | ArrayBuffer | HTMLAudioElement | AudioBuffer): Sound {
        let s = PixiSound.from(source);
        return new Sound(s.media, s.options);
    }
}
