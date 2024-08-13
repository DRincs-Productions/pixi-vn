import ICanvasImageMemory from "./ICanvasImageMemory";

/**
 * The memory of the video. It uses for save the state of the video.
 */
export default interface ICanvasVideoMemory extends ICanvasImageMemory {
    loop: boolean,
    paused: boolean,
}
