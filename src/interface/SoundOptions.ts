import { Options, PlayOptions } from "@pixi/sound";

export default interface SoundOptions extends Omit<Options, "complete" | "loaded" | "sprites" | "source"> { }

export interface SoundPlayOptions extends Omit<PlayOptions, "complete" | "loaded"> { }