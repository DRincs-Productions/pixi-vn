import { SpriteVideo } from "../classes"
import { newLabel } from "../decorators"
import { showWithDissolveTransition } from "../functions"
import { canvas, narration } from "../managers"
import { juliette, videoLink } from "./TestConstant"

const VIDEO_TEST_LABEL = "___pixi_vn_video_test___"
export const videoTest = newLabel(VIDEO_TEST_LABEL, [
    async () => {
        narration.dialogue = {
            character: juliette,
            text: `This is the test of video elements in a canvas. I have added a video element to the canvas with dissolve transition.`
        };
        showWithDissolveTransition("video", videoLink, { duration: 1 })
    },
    async () => {
        narration.dialogue = {
            character: juliette,
            text: `The video is now paused.`
        };
        let video = canvas.find<SpriteVideo>("video")
        if (video) {
            video.pause()
        }
    },
    async () => {
        narration.dialogue = {
            character: juliette,
            text: `The video is now playing.`
        };
        let video = canvas.find<SpriteVideo>("video")
        if (video) {
            video.play()
            video.loop = true
        }
    },
    async () => {
        narration.dialogue = {
            character: juliette,
            text: `The video is now restarted.`
        };
        let video = canvas.find<SpriteVideo>("video")
        if (video) {
            video.restart()
        }
    },
])
