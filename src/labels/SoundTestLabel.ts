import { newLabel } from "../decorators";
import { sound } from "../managers";
import { loop1Audio } from "./TestConstant";

const SOUND_TEST_LABEL = "___pixi_vn_sound_test___"

export const soundTestLabel = newLabel(SOUND_TEST_LABEL,
    [
        () => {
            sound.add("audio", loop1Audio)
            sound.play("audio")
        },
        () => {
            sound.play("audio", {
                loop: true
            })
        },
    ]
)
