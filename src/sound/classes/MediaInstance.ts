import type MediaInterface from "@sound/interfaces/MediaInterface";
import type { MediaMemory } from "@sound/interfaces/MediaInterface";
import SoundRegistry from "@sound/SoundRegistry";
import { isFilter } from "@sound/utils/filter-utility";
import {
    type BasicPlaybackState,
    Player,
    type PlayerOptions,
    type ToneAudioNode,
    now as toneNow,
} from "tone";
import type { Time } from "tone/build/esm/core/type/Units";

export default class MediaInstance extends Player implements MediaInterface {
    constructor(
        readonly alias: string,
        readonly channelAlias: string,
        readonly soundAlias: string,
        readonly stepCounter: number,
        options: Partial<PlayerOptions> = {},
        readonly delay?: number,
    ) {
        super(options);
        this.options = options;
    }
    readonly options: Partial<PlayerOptions>;
    readonly filters: Set<ToneAudioNode> = new Set();
    private readonly startTime = toneNow();
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
            elapsed: this.elapsed ?? toneNow() - this.startTime,
            paused: this.paused,
        };
        return options;
    }
    set memory(options: MediaMemory) {
        this.paused = options.paused;
        if (this.loop !== (options.loop || false)) {
            this.loop = options.loop || false;
        }
        if (this.volume.value !== (options.volume ?? 1)) {
            this.volume.value = options.volume ?? 1;
        }
        if (this.mute !== (options.mute || false)) {
            this.mute = options.mute || false;
        }
        if (this.playbackRate !== (options.playbackRate ?? 1)) {
            this.playbackRate = options.playbackRate ?? 1;
        }
        if (this.reverse !== (options.reverse || false)) {
            this.reverse = options.reverse || false;
        }
        if (this.fadeIn !== (options.fadeIn || 0)) {
            this.fadeIn = options.fadeIn || 0;
        }
        if (this.loopStart !== (options.loopStart || 0)) {
            this.loopStart = options.loopStart || 0;
        }
        if (this.loopEnd !== (options.loopEnd || 0)) {
            this.loopEnd = options.loopEnd || 0;
        }
    }
    private elapsed: undefined | number;
    get paused(): boolean {
        return typeof this.elapsed === "number";
    }
    set paused(value: boolean) {
        const state = this.state;
        if (value) {
            this.elapsed = toneNow() - this.startTime;
            if (state === "started") {
                super.stop();
            }
        } else {
            if (typeof this.elapsed === "number") {
                super.start(undefined, this.elapsed);
                this.elapsed = undefined;
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
    override chain(...nodes: ToneAudioNode[]): this {
        nodes.forEach((node) => {
            if (isFilter(node)) {
                node.toDestination();
                this.filters.add(node);
            }
        });
        return super.chain(...nodes);
    }
    override disconnect(node: ToneAudioNode): this {
        if (isFilter(node)) {
            node.disconnect();
            this.filters.delete(node);
        }
        return super.disconnect(node);
    }
}
