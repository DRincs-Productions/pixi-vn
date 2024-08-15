import { CanvasVideo } from "../classes"
import { newLabel } from "../decorators"
import { setDialogue, showWithDissolveTransition } from "../functions"
import { canvas } from "../managers"
import { juliette } from "./TestConstant"

const VIDEO_TEST_LABEL = "___pixi_vn_video_test___"
export const videoTest = newLabel(VIDEO_TEST_LABEL, [
    async () => {
        setDialogue({
            character: juliette,
            text: `This is the test of video elements in a canvas. I have added a video element to the canvas with dissolve transition.`
        });
        showWithDissolveTransition("video", "https://pixijs.com/assets/video.mp4", { duration: 1 })
    },
    async () => {
        setDialogue({
            character: juliette,
            text: `The video is now paused.`
        });
        let video = canvas.getCanvasElement<CanvasVideo>("video")
        if (video) {
            video.pause()
        }
    },
    async () => {
        setDialogue({
            character: juliette,
            text: `The video is now playing.`
        });
        let video = canvas.getCanvasElement<CanvasVideo>("video")
        if (video) {
            video.play()
            video.loop = true
        }
    },
    async () => {
        setDialogue({
            character: juliette,
            text: `The video is now restarted.`
        });
        let video = canvas.getCanvasElement<CanvasVideo>("video")
        if (video) {
            video.restart()
        }
    },
])
