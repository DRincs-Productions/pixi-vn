import ImageSpriteMemory from "./ImageSpriteMemory";

/**
 * The memory of the video. It uses for save the state of the video.
 */
export default interface VideoSpriteMemory extends ImageSpriteMemory {
    loop: boolean,
    paused: boolean,
    currentTime: number,
}
