import type { Assets } from "@drincs/pixi-vn/pixi.js";
import { Sound, SoundLibrary } from "@pixi/sound";
import SoundGameState from "./SoundGameState";
import { SoundPlayOptions } from "./SoundOptions";

export default interface SoundManagerInterface extends Omit<SoundLibrary, "init" | "close" | "add"> {
    /**
     * @deprecated You can define sound assets directly in {@link Assets}
     */
    add(alias: string, options?: SoundPlayOptions | string): Sound;
    backgroundLoad(alias: string | string[]): Promise<void>;
    backgroundLoadBundle(alias: string): Promise<void>;
    clear(): void;
    export(): SoundGameState;
    removeOldSoundAndExport(): SoundGameState;
    restore(data: object): void;
}
