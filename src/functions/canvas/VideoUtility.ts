import { Texture } from 'pixi.js';
import CanvasVideo from '../../classes/canvas/CanvasVideo';
import { GameWindowManager } from '../../managers';
import { getTexture } from '../TextureUtility';

export function addVideo(tag: string, videoUrl: string): CanvasVideo {
    let video = new CanvasVideo()
    video.videoLink = videoUrl
    GameWindowManager.addCanvasElement(tag, video)
    return video
}

export async function loadVideo(canvasVideos: CanvasVideo[] | CanvasVideo): Promise<CanvasVideo[]> {
    if (!Array.isArray(canvasVideos)) {
        return [canvasVideos]
    }
    let promises: Promise<void | Texture>[] = Array<Promise<void | Texture>>(canvasVideos.length)
    for (let i = 0; i < canvasVideos.length; i++) {
        promises[i] = getTexture(canvasVideos[i].videoLink)
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

export async function showVideo(tag: string, videoUrl: string): Promise<CanvasVideo> {
    let video = addVideo(tag, videoUrl)
    await video.load()
    return video
}
