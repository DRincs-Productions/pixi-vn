import * as Tone from "tone";
import type IMediaInstance from "@sound/interfaces/IMediaInstance";

let _idCounter = 0;

/**
 * Wraps a Tone.js {@link Tone.Player} and exposes the {@link IMediaInstance}
 * interface expected by the rest of the sound system.
 *
 * Pause / resume is implemented by stopping the player and remembering the
 * current playback offset so that playback can be resumed from the same
 * position.
 */
export default class ToneMediaInstance implements IMediaInstance {
    private readonly _player: Tone.Player;
    private _paused = false;
    private _muted = false;
    private _volume = 1;
    private _loop = false;
    private _speed = 1;
    /** Accumulated playback offset in seconds (updated on every pause). */
    private _offset = 0;
    /** Tone.js context time at which the player was last started. */
    private _startContextTime: number | null = null;
    /** `true` while a manual pause-stop is in flight (so onstop knows to skip firing "end"). */
    private _pausing = false;
    private readonly _listeners: Record<string, Array<(...args: unknown[]) => void>> = {};

    readonly id: number;

    constructor(player: Tone.Player, startImmediately = true) {
        this._player = player;
        this.id = ++_idCounter;

        player.onstop = () => {
            if (this._pausing) {
                // onstop triggered by our own pause — do not fire "end".
                this._pausing = false;
                return;
            }
            // Natural playback end OR explicit stop() call — fire "end".
            this._fireEnd();
        };

        if (startImmediately) {
            player.start();
            this._startContextTime = Tone.now();
        }
    }

    // ------------------------------------------------------------------ //
    // IMediaInstance properties                                            //
    // ------------------------------------------------------------------ //

    get paused(): boolean {
        return this._paused;
    }
    set paused(v: boolean) {
        if (v === this._paused) return;
        if (v) {
            // Record how far we got before pausing.
            if (this._startContextTime !== null) {
                this._offset += Tone.now() - this._startContextTime;
                this._startContextTime = null;
            }
            this._pausing = true;
            this._player.stop();
        } else {
            // Resume from saved offset.
            this._startContextTime = Tone.now();
            this._player.start(Tone.now(), this._offset);
        }
        this._paused = v;
    }

    get volume(): number {
        return this._volume;
    }
    set volume(v: number) {
        this._volume = v;
        // Tone.js volume is in dB; convert from linear [0, 1].
        this._player.volume.value = v <= 0 ? -Infinity : 20 * Math.log10(v);
    }

    get muted(): boolean {
        return this._muted;
    }
    set muted(v: boolean) {
        this._muted = v;
        this._player.mute = v;
    }

    get loop(): boolean {
        return this._loop;
    }
    set loop(v: boolean) {
        this._loop = v;
        this._player.loop = v;
    }

    get speed(): number {
        return this._speed;
    }
    set speed(v: number) {
        this._speed = v;
        this._player.playbackRate = v;
    }

    stop(): void {
        this._offset = 0;
        this._startContextTime = null;
        this._player.stop();
        // onstop callback fires → _fireEnd() is called.
    }

    on(event: string, fn: (...args: unknown[]) => void): void {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(fn);
    }

    // ------------------------------------------------------------------ //
    // Internals                                                            //
    // ------------------------------------------------------------------ //

    private _fireEnd(): void {
        const handlers = this._listeners["end"] ?? [];
        for (const fn of handlers) fn();
    }
}
