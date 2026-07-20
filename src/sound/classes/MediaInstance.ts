import type MediaInterface from "@sound/interfaces/MediaInterface";
import type { MediaMemory } from "@sound/interfaces/MediaInterface";
import SoundRegistry from "@sound/SoundRegistry";
import { isFilter } from "@sound/utils/filter-utility";
import { decibelsToLinear, linearToDecibels } from "@sound/utils/sound-utility";
import { Player, type PlayerOptions, type ToneAudioNode, now as toneNow } from "tone";

type StopTime = Parameters<Player["stop"]>[0];
type StartTime = Parameters<Player["start"]>[0];
type StartOffset = Parameters<Player["start"]>[1];
type StartDuration = Parameters<Player["start"]>[2];
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
        this.playStartTime = toneNow() + (delay ?? 0);
    }
    readonly options: Partial<PlayerOptions>;
    readonly filters: Set<ToneAudioNode> = new Set();
    /**
     * Set to `toneNow()` the moment playback is paused; cleared on resume.
     * Used to compute how long the instance was paused so that
     * `playStartTime` can be adjusted accordingly.
     */
    private pausedAt: number | undefined = undefined;
    /**
     * Tracks the effective playback start time in Tone's clock, adjusted
     * after each resume to exclude all time spent paused.
     * Invariant: `toneNow() - playStartTime` equals actual playback position
     * while the player is playing.
     */
    private playStartTime = toneNow();
    get memory() {
        const elapsed = Math.max(
            0,
            this.pausedAt ? this.pausedAt - this.playStartTime : toneNow() - this.playStartTime,
        );
        let paused = this.paused;
        if (paused && SoundRegistry.systemPausedAliases.has(this.alias)) {
            // Hide system-wide pauses from persisted/exported state so
            // `unsaved.resumeAll` does not try to resume this instance again.
            paused = false;
        }
        const options: MediaMemory = {
            ...this.options,
            fadeIn: this.fadeIn,
            loop: this.loop,
            loopEnd: this.loopEnd,
            loopStart: this.loopStart,
            mute: this.mute,
            playbackRate: this.playbackRate,
            reverse: this.reverse,
            volume: decibelsToLinear(this.volume.value),
            autostart: !this.paused,
            elapsed: elapsed,
            paused: paused,
            delay: this.delay,
        };
        return options;
    }
    set memory(options: MediaMemory) {
        this.paused = options.paused;
        if (this.loop !== (options.loop || false)) {
            this.loop = options.loop || false;
        }
        if (this.volume.value !== linearToDecibels(options.volume ?? 1)) {
            this.volume.value = linearToDecibels(options.volume ?? 1);
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
    get paused(): boolean {
        return typeof this.pausedAt === "number";
    }
    set paused(value: boolean) {
        const state = this.state;
        if (value) {
            // Record the wall-clock time at which we pause so the resume path
            // can shift playStartTime forward by the exact paused duration.
            this.pausedAt = toneNow();
            if (state === "started") {
                super.stop();
            }
        } else {
            let elapsed: number | undefined;
            let wasActuallyPaused = false;
            // Only restart when the player was explicitly paused (pausedAt was set).
            // Without this guard, a delayed player whose state is "stopped" because
            // its scheduled start is still in the future would be started a second
            // time, causing Tone.js to throw "Start time must be strictly greater
            // than previous start time".
            if (typeof this.pausedAt === "number") {
                wasActuallyPaused = true;
                elapsed = this.pausedAt - this.playStartTime;
                this.pausedAt = undefined;
            }
            if (wasActuallyPaused && state === "stopped") {
                if (this.delay) {
                    this.start(`+${this.delay}`, elapsed);
                } else {
                    this.start(undefined, elapsed);
                }
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
    override stop(time?: StopTime): this {
        SoundRegistry.mediaInstances.delete(this.alias);
        return super.stop(time);
    }
    override start(time?: StartTime, offset?: StartOffset, duration?: StartDuration): this {
        const now = toneNow();
        let startAt = now;
        if (typeof time === "number") {
            startAt = time;
        } else if (typeof time === "string" && time.startsWith("+")) {
            const relative = Number(time.slice(1));
            if (!Number.isNaN(relative)) {
                startAt = now + relative;
            }
        }
        const startOffset = typeof offset === "number" ? offset : 0;
        this.playStartTime = startAt - startOffset;
        return super.start(time, offset, duration);
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
