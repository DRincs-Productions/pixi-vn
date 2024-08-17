import { CompleteCallback, Filter, filters, IMediaInstance, Options, Sound as PixiSound, PlayOptions } from "@pixi/sound";
import { narration } from "../managers";
import SoundManagerStatic from "../managers/SoundManagerStatic";

export default class Sound extends PixiSound {
    alias?: string;
    override pause(): this {
        if (!this.alias) {
            throw new Error("[Pixi'VN] The alias is not defined.");
        }
        delete SoundManagerStatic.playrdInstoSteps[this.alias];
        return super.pause();
    }
    override resume(): this {
        if (!this.alias) {
            throw new Error("[Pixi'VN] The alias is not defined.");
        }
        SoundManagerStatic.playrdInstoSteps[this.alias] = {
            stepIndex: narration.lastStepIndex
        }
        return super.resume();
    }
    override set filters(f: Filter[]) {
        super.filters = f.filter(f => {
            return !(f instanceof filters.Filter);
        })
    }
    override destroy(): void {
        if (this.alias) {
            delete SoundManagerStatic.playrdInstoSteps[this.alias];
        }
        return super.destroy();
    }
    override stop(): this {
        if (!this.alias) {
            throw new Error("[Pixi'VN] The alias is not defined.");
        }
        delete SoundManagerStatic.playrdInstoSteps[this.alias];
        return super.stop();
    }
    override play(alias: string, callback?: CompleteCallback): IMediaInstance | Promise<IMediaInstance>;
    override play(source?: string | PlayOptions | CompleteCallback, callback?: CompleteCallback): IMediaInstance | Promise<IMediaInstance>;
    override play(source?: any, callback?: any): IMediaInstance | Promise<IMediaInstance> {
        if (typeof source === 'string') {
            this.alias = source;
        }
        if (!this.alias) {
            throw new Error("[Pixi'VN] The alias is not defined.");
        }
        SoundManagerStatic.playrdInstoSteps[this.alias] = {
            stepIndex: narration.lastStepIndex
        }
        return super.play(source, callback);
    }

    /**
     * https://github.com/pixijs/sound/blob/main/src/Sound.ts#L235
     */
    public static from(source: string | string[] | Options | ArrayBuffer | HTMLAudioElement | AudioBuffer): Sound {
        let s = PixiSound.from(source);
        return new Sound(s.media, s.options);
    }
}
