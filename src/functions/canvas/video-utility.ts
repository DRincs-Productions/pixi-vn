import { Texture } from 'pixi.js';
import VideoSprite from '../../classes/canvas/VideoSprite';
import { canvas } from '../../managers';
import { getTexture } from '../texture-utility';

/**
 * Add a video in the canvas.
 * Is the same that {@link showVideo}, but the video is not shown.
 * If you want to show the video, then you need to use the function {@link VideoSprite.load()}.
 * @param alias is the unique alias of the video. You can use this alias to refer to this video
 * @param videoUrl is the url of the video.
 * @returns the container of the video.
 * @example
 * ```typescript
 * let alien = addVideo("bunny1", "https://pixijs.com/assets/video.mp4")
 * await alien.load()
 * ```
 */
export function addVideo(alias: string, videoUrl: string): VideoSprite {
    let video = new VideoSprite()
    video.textureAlias = videoUrl
    canvas.add(alias, video)
    return video
}

/**
 * Show a list of videos in the canvas, at the same time.
 * @param canvasVideos is a list of videos to show.
 * @returns the list of videos.
 */
export async function loadVideo(canvasVideos: VideoSprite[] | VideoSprite): Promise<VideoSprite[]> {
    if (!Array.isArray(canvasVideos)) {
        return [canvasVideos]
    }
    let promises: Promise<void | Texture>[] = Array<Promise<void | Texture>>(canvasVideos.length)
    for (let i = 0; i < canvasVideos.length; i++) {
        promises[i] = getTexture(canvasVideos[i].textureAlias)
    }
    // wait for all promises
    return Promise.all(promises).then((textures) => {
        return textures.map((texture, index) => {
            if (texture) {
                canvasVideos[index].texture = texture
                return canvasVideos[index]
            }
            canvasVideos[index].load()
            return canvasVideos[index]
        })
    })
}

/**
 * Add and show a video in the canvas. This function is a combination of {@link addVideo} and {@link loadVideo}.
 * @param alias The unique alias of the video. You can use this alias to refer to this video
 * @param videoUrl The url of the video.
 * @returns A promise that is resolved when the video is loaded.
 */
export async function showVideo(alias: string, videoUrl: string): Promise<VideoSprite> {
    let video = addVideo(alias, videoUrl)
    await video.load()
    return video
}
