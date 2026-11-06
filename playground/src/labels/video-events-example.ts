import { storage } from "@drincs/pixi-vn";
import {
    Assets,
    canvas,
    RegisteredEvents,
    showVideo,
    type VideoSprite,
} from "@drincs/pixi-vn/canvas";
import { narration } from "@drincs/pixi-vn/narration";
import { registerTestLabel } from "./registry";

// Video alias. It is registered when the module is imported (not inside a step), so it also resolves
// when a save is loaded or the player goes back without running the first step again.
const VIDEO = "playground-video-events";
if (!Assets.resolver.hasKey(VIDEO)) {
    Assets.add({
        alias: VIDEO,
        src: "https://pixijs.com/assets/video.mp4",
        // muted so the browser allows playback without a user gesture; no autoplay, the label controls it
        data: { muted: true, autoPlay: false },
    });
}

/** Storage key incremented by the "ended" listener; read it via `window.pixiVN.storage`. */
const ENDED_COUNTER_KEY = "playground-video-ended-count";
/** Marker written in the dialogue by the "ended" listener, easy to match from browser automation. */
const ENDED_MARKER = "[VIDEO ENDED]";

/** Savable "ended" listener (same as `@eventDecorator()`, registered by hand to avoid decorators here). */
function onVideoEnded(component: VideoSprite) {
    const count = ((storage.get(ENDED_COUNTER_KEY) as number | undefined) ?? 0) + 1;
    storage.set(ENDED_COUNTER_KEY, count);
    narration.dialogue = {
        text: `${ENDED_MARKER} "${component.label}" ended (count: ${count}).`,
    };
}
RegisteredEvents.add(onVideoEnded, "playground-video-events-on-ended");

function getVideoElement(video: VideoSprite): HTMLVideoElement | undefined {
    const resource = video.texture?.source?.resource;
    return resource instanceof HTMLVideoElement ? resource : undefined;
}

/**
 * Real playback check for the VideoSprite "ended" event: the listener must fire exactly once when the
 * video actually ends, survive a JSON memory round trip, and not fire while a save is restored.
 */
registerTestLabel(
    "video-events-example",
    "Canvas: VideoSprite ended event",
    [
        async () => {
            canvas.clear();
            const video = await showVideo(VIDEO, {
                loop: false,
                paused: true,
                anchor: 0.5,
                align: 0.5,
            });
            const element = getVideoElement(video);
            if (element) {
                element.muted = true;
            }
            video.on("ended", onVideoEnded);
            narration.dialogue = {
                text: `A paused, muted video is centered on the canvas with a saved "ended" listener. Inspect the frame and the memory (onEvents.ended) now; continue to play it near its end. Expected marker: ${ENDED_MARKER}, counter key: "${ENDED_COUNTER_KEY}".`,
            };
        },
        async () => {
            const video = canvas.find<VideoSprite>(VIDEO);
            const element = video && getVideoElement(video);
            if (!video || !element) {
                narration.dialogue = { text: `Video "${VIDEO}" not found on the canvas.` };
                return;
            }
            if (element.readyState < HTMLMediaElement.HAVE_METADATA) {
                narration.dialogue = { text: "Waiting for the video metadata (duration)..." };
                await new Promise<void>((resolve) =>
                    element.addEventListener("loadedmetadata", () => resolve(), { once: true }),
                );
            }
            const duration = video.duration ?? 0;
            video.currentTime = Math.max(0, duration - 0.5);
            video.play();
            narration.dialogue = {
                text: `Playing from ${video.currentTime.toFixed(2)}s of ${duration.toFixed(2)}s. Waiting for the "ended" event: this text must be replaced by ${ENDED_MARKER} within about half a second.`,
            };
        },
    ],
    "Canvas components",
);
