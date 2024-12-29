import { Label } from "../classes";
import { filters } from "../constants";
import { narration, sound } from "../managers";
import { juliette, musicalAudio, SOUND_TEST_LABEL } from "./TestConstant";

export const soundTestLabel = new Label(SOUND_TEST_LABEL,
    [
        () => {
            narration.dialogue = {
                character: juliette,
                text: "This is a sound test label. You should be hearing a loop1Audio sound."
            }
            sound.add("audio", musicalAudio)
            sound.play("audio")
        },
        () => {
            narration.dialogue = {
                character: juliette,
                text: "Now the sound should be stopped."
            }
            sound.stop("audio")
        },
        () => {
            narration.dialogue = {
                character: juliette,
                text: "Now the sound should be playing again, with loop"
            }
            let s = sound.find("audio")
            s.loop = true
            s.play()
        },
        () => {
            narration.dialogue = {
                character: juliette,
                text: "Now the sound should be stopped."
            }
            sound.stop("audio")
        },
        () => {
            narration.dialogue = {
                character: juliette,
                text: "Now the sound should be playing again, with loop and ReverbFilter"
            }
            let s = sound.add("audio", {
                loop: true,
                url: musicalAudio,
            })
            s.filters = [new filters.ReverbFilter()]
            sound.play("audio")
        },
        async (props) => {
            sound.stop("audio")
            await narration.goNext(props)
        },
    ]
)
