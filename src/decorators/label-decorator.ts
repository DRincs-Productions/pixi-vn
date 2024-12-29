import { Label } from "../classes"
import LabelAbstract from "../classes/LabelAbstract"
import { LabelProps } from "../interface"
import { pixivnTestStartLabel } from "../labels"
import { baseCanvasElementTestLabel } from "../labels/BaseCanvasElementTestLabel"
import { canvasEventsTestLabel } from "../labels/CanvasEventsTestLabel"
import { customTickerCanvasElementTestLabel } from "../labels/CustomTickerCanvasElementTestLabel"
import { imagesAnimationsTest } from "../labels/ImagesAnimationsTestLabel"
import { inputTestLabel } from "../labels/InputTestLabel"
import { markdownTest } from "../labels/MarkdownTest"
import { soundTestLabel } from "../labels/SoundTestLabel"
import { openLink, pixivnTestStartLabel2 } from "../labels/StartLabel"
import { stepLabelTestLAbel } from "../labels/StepLabelTest"
import { BASE_CANVAS_ELEMENT_LABEL, CANVAS_EVENTS_TEST_LABEL, CUSTOM_TICKER_CANVAS_ELEMENT_TEST_LABEL, IMAGE_ANIMAIONS_TEST_LABEL, INPUT_TEST_LABEL, MARKDOWN_TEST_LABEL, OPEN_LINK_LABEL, RESTART_TEST_LABEL, SOUND_TEST_LABEL, STEP_LABEL_TEST_LABEL, TEST_LABEL, VIDEO_TEST_LABEL } from "../labels/TestConstant"
import { videoTest } from "../labels/VideoTestLabel"
import { StepLabelType } from "../types"
import { LabelIdType } from "../types/LabelIdType"

export const registeredLabels: { [key: LabelIdType]: (LabelAbstract<any> | Label<any>) } = {
    [BASE_CANVAS_ELEMENT_LABEL]: baseCanvasElementTestLabel,
    [CANVAS_EVENTS_TEST_LABEL]: canvasEventsTestLabel,
    [CUSTOM_TICKER_CANVAS_ELEMENT_TEST_LABEL]: customTickerCanvasElementTestLabel,
    [IMAGE_ANIMAIONS_TEST_LABEL]: imagesAnimationsTest,
    [INPUT_TEST_LABEL]: inputTestLabel,
    [MARKDOWN_TEST_LABEL]: markdownTest,
    [SOUND_TEST_LABEL]: soundTestLabel,
    [STEP_LABEL_TEST_LABEL]: stepLabelTestLAbel,
    [VIDEO_TEST_LABEL]: videoTest,
    [TEST_LABEL]: pixivnTestStartLabel,
    [OPEN_LINK_LABEL]: openLink,
    [RESTART_TEST_LABEL]: pixivnTestStartLabel2,
}

/**
 * Creates a new label and registers it in the system.
 * **This function must be called at least once at system startup to register the label, otherwise the system cannot be used.**
 * @param id The id of the label, it must be unique
 * @param steps The steps of the label
 * @param props The properties of the label
 * @returns The created label
 */
export function newLabel<T extends {} = {}>(id: LabelIdType, steps: StepLabelType<T>[] | (() => StepLabelType<T>[]), props?: Omit<LabelProps<Label<T>>, "choiseIndex">): Label<T> {
    if (registeredLabels[id]) {
        console.info(`[Pixi’VN] Label ${id} already exists, it will be overwritten`)
    }
    let label = new Label<T>(id, steps, props)
    registeredLabels[id] = label
    return label
}

/**
 * Gets a label by its id
 * @param id The id of the label
 * @returns The label or undefined if it does not exist
 */
export function getLabelById<T = Label<any>>(id: LabelIdType): T | undefined {
    let label = registeredLabels[id]
    if (!label) {
        console.error(`[Pixi’VN] Label ${id} not found`)
        return
    }
    return label as T
}

/**
 * Saves a label in the system
 * @param label The label to be saved
 */
export function saveLabel<T extends LabelAbstract<any>>(label: T) {
    registeredLabels[label.id] = label
}
