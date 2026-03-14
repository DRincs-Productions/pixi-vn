import { CompleteCallback, IMediaInstance, PlayOptions, Sound, SoundLibrary } from "@pixi/sound";
import AudioChannelInterface from "../interfaces/AudioChannelInterface";

export default class AudioChannel implements AudioChannelInterface {
    get disableAutoPause(): boolean {
        throw new Error("Method not implemented.");
    }
    set disableAutoPause(autoPause: boolean) {
        throw new Error("Method not implemented.");
    }
    remove(alias: string): SoundLibrary {
        throw new Error("Method not implemented.");
    }
    get volumeAll(): number {
        throw new Error("Method not implemented.");
    }
    set volumeAll(volume: number) {
        throw new Error("Method not implemented.");
    }
    get speedAll(): number {
        throw new Error("Method not implemented.");
    }
    set speedAll(speed: number) {
        throw new Error("Method not implemented.");
    }
    togglePauseAll(): boolean {
        throw new Error("Method not implemented.");
    }
    pauseAll(): SoundLibrary {
        throw new Error("Method not implemented.");
    }
    resumeAll(): SoundLibrary {
        throw new Error("Method not implemented.");
    }
    toggleMuteAll(): boolean {
        throw new Error("Method not implemented.");
    }
    muteAll(): SoundLibrary {
        throw new Error("Method not implemented.");
    }
    unmuteAll(): SoundLibrary {
        throw new Error("Method not implemented.");
    }
    removeAll(): SoundLibrary {
        throw new Error("Method not implemented.");
    }
    stopAll(): SoundLibrary {
        throw new Error("Method not implemented.");
    }
    exists(alias: string, assert?: boolean): boolean {
        throw new Error("Method not implemented.");
    }
    isPlaying(): boolean {
        throw new Error("Method not implemented.");
    }
    find(alias: string): Sound {
        throw new Error("Method not implemented.");
    }
    play(alias: string, options?: PlayOptions | CompleteCallback | string): IMediaInstance | Promise<IMediaInstance> {
        throw new Error("Method not implemented.");
    }
    stop(alias: string): Sound {
        throw new Error("Method not implemented.");
    }
    pause(alias: string): Sound {
        throw new Error("Method not implemented.");
    }
    resume(alias: string): Sound {
        throw new Error("Method not implemented.");
    }
    volume(alias: string, volume?: number): number {
        throw new Error("Method not implemented.");
    }
    speed(alias: string, speed?: number): number {
        throw new Error("Method not implemented.");
    }
    duration(alias: string): number {
        throw new Error("Method not implemented.");
    }
}
