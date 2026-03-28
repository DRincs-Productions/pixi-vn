import { IMediaInstance as PixiMediaInstance } from "@pixi/sound";

type IMediaInstance = Omit<PixiMediaInstance, "on" | "destroy" | "init" | "off" | "once" | "toString">;
export default IMediaInstance;
