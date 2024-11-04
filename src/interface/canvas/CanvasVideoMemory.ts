import CanvasImageMemory from "./CanvasImageMemory";

/**
 * The memory of the video. It uses for save the state of the video.
 */
export default interface CanvasVideoMemory extends CanvasImageMemory {
    loop: boolean,
    paused: boolean,
    currentTime: number,
}
