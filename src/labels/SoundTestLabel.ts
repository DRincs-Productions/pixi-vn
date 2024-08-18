import { filters } from "../constants";
import { newLabel } from "../decorators";
import { setDialogue } from "../functions";
import { narration, sound } from "../managers";
import { juliette, musicalAudio } from "./TestConstant";

const SOUND_TEST_LABEL = "___pixi_vn_sound_test___"

export const soundTestLabel = newLabel(SOUND_TEST_LABEL,
    [
        () => {
            setDialogue({
                character: juliette,
                text: "This is a sound test label. You should be hearing a loop1Audio sound."
            })
            sound.add("audio", musicalAudio)
            sound.play("audio")
        },
        () => {
            setDialogue({
                character: juliette,
                text: "Now the sound should be stopped."
            })
            sound.stop("audio")
        },
        () => {
            setDialogue({
                character: juliette,
                text: "Now the sound should be playing again, with loop"
            })
            let s = sound.find("audio")
            s.loop = true
            s.play()
        },
        () => {
            setDialogue({
                character: juliette,
                text: "Now the sound should be stopped."
            })
            sound.stop("audio")
        },
        () => {
            setDialogue({
                character: juliette,
                text: "Now the sound should be playing again, with loop and MonoFilter"
            })
            let s = sound.add("audio", {
                loop: true,
                url: musicalAudio,
            })
            s.filters = [new filters.ReverbFilter()]
            sound.play("audio")
        },
        (props) => {
            sound.stop("audio")
            narration.goNext(props)
        },
    ]
)
