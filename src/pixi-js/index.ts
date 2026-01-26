import * as PIXI from "pixi.js";

if (typeof window !== "undefined") {
    (window as any).PIXI = PIXI;
}

export * from "pixi.js";
export default PIXI;
