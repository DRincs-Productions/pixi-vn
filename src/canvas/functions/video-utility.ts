import { Assets } from "pixi.js";
import { canvas, VideoSpriteOptions } from "..";
import VideoSprite from "../components/VideoSprite";

/**
 * Add a video in the canvas.
 * Is the same that {@link showVideo}, but the video is not shown.
 * If you want to show the video, then you need to use the function {@link VideoSprite.load()}.
 * @param alias is the unique alias of the video. You can use this alias to refer to this video
 * @param videoUrl is the url of the video. If you don't provide the url, then the alias is used as the url.
 * @param options The options of the video.
 * @returns the container of the video.
 * @example
 * ```typescript
 * let video1 = addVideo("video1", "https://pixijs.com/assets/video1.mp4")
 * await video1.load()
 * Assets.add({ alias: "video2", src: "https://pixijs.com/assets/video2.png" })
 * let video2 = addVideo("video2")
 * await video2.load()
 * ```
 */
export function addVideo(alias: string, videoUrl?: string, options?: VideoSpriteOptions): VideoSprite {
    if (!videoUrl) {
        if (Assets.resolver.hasKey(alias)) {
            videoUrl = alias;
        } else {
            throw new Error(`The video ${alias} does not exist in the cache.`);
        }
    }
    let video = new VideoSprite(options, videoUrl);
    canvas.add(alias, video);
    return video;
}

/**
 * Add and show a video in the canvas. This function is a combination of {@link addVideo} and {@link loadVideo}.
 * @param alias The unique alias of the video. You can use this alias to refer to this video
 * @param videoUrl The url of the video.
 * @param options The options of the video.
 * @returns A promise that is resolved when the video is loaded.
 * @example
 * ```typescript
 * let video1 = showVideo("video1", "https://pixijs.com/assets/video1.mp4")
 * Assets.add({ alias: "video2", src: "https://pixijs.com/assets/video2.png" })
 * let video2 = showVideo("video2")
 * ```
 */
export async function showVideo(alias: string, videoUrl?: string, options?: VideoSpriteOptions): Promise<VideoSprite> {
    if (!videoUrl) {
        if (Assets.resolver.hasKey(alias)) {
            videoUrl = alias;
        } else {
            throw new Error(`The video ${alias} does not exist in the cache.`);
        }
    }
    let video = new VideoSprite(options, videoUrl);
    await video.load();
    canvas.add(alias, video);
    return video;
}
