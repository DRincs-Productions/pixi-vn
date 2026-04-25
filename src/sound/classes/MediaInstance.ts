import type MediaInteface from "@sound/interfaces/MediaInteface";
import type { MediaMemory } from "@sound/interfaces/MediaInteface";
import SoundRegistry from "@sound/SoundRegistry";
import { type BasicPlaybackState, type InputNode, Player, type PlayerOptions } from "tone";
import type { Time } from "tone/build/esm/core/type/Units";

export default class MediaInstance extends Player implements MediaInteface {
    constructor(
        readonly alias: string,
        readonly channelAlias: string,
        readonly soundAlias: string,
        readonly stepCounter: number,
        options: Partial<PlayerOptions> = {},
    ) {
        super(options);
        this.options = options;
    }
    readonly options: Partial<PlayerOptions>;
    readonly filters: InputNode[] = [];
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
                super.stop();
            }
        } else {
            if (typeof this.offset === "number") {
                super.start(undefined, this.offset);
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
    override stop(time?: Time): this {
        SoundRegistry.mediaInstances.delete(this.alias);
        return super.stop(time);
    }
    override chain(...nodes: InputNode[]): this {
        this.filters.push(...nodes);
        return super.chain(...nodes);
    }
}
