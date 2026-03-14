import { SoundLibrary } from "@pixi/sound";

export default interface AudioChannelInterface extends Omit<
    SoundLibrary,
    "init" | "add" | "context" | "filtersAll" | "supported" | "useLegacy" | "close"
> {}
