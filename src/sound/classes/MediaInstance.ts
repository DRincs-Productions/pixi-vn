import type MediaInteface from "@sound/interfaces/MediaInteface";
import type { MediaMemory } from "@sound/interfaces/MediaInteface";
import { type BasicPlaybackState, Player, type PlayerOptions } from "tone";

export default class MediaInstance extends Player implements MediaInteface {
    constructor(options: Partial<PlayerOptions> = {}) {
        super(options);
        this.options = options;
    }
    private readonly options: Partial<PlayerOptions>;
    get memory() {
        const options: MediaMemory = {
            ...this.options,
            fadeIn: this.fadeIn,
            loop: this.loop,
            loopEnd: this.loopEnd,
            loopStart: this.loopStart,
            mute: this.mute,
            playbackRate: this.playbackRate,
            reverse: this.reverse,
            volume: this.volume.value,
            autostart: !this.paused,
            offset: this.now(),
        };
        return options;
    }
    private offset: undefined | number;
    get paused(): boolean {
        return typeof this.offset === "number";
    }
    set paused(value: boolean) {
        if (value) {
            if (this.state === "started") {
                this.offset = this.now();
                this.stop();
            }
        } else {
            if (typeof this.offset === "number") {
                this.start(undefined, this.offset);
                this.offset = undefined;
            }
        }
    }
    get muted(): boolean {
        return this.mute;
    }
    set muted(value: boolean) {
        this.mute = value;
    }
    get speed(): number {
        return this.playbackRate;
    }
    set speed(value: number) {
        this.playbackRate = value;
    }
    override get state() {
        if (this.paused) {
            return "paused" as BasicPlaybackState;
        }
        return super.state;
    }
}
