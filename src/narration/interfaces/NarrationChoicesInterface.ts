import type { StepLabelPropsType, StepLabelResultType } from "..";
import type { StoredIndexedChoiceInterface } from "./StoredChoiceInterface";
import type StoredChoiceInterface from "./StoredChoiceInterface";

export default interface NarrationChoicesInterface {
    /**
     * The choices to be shown in the game.
     */
    get list(): StoredIndexedChoiceInterface[] | undefined;
    /**
     * The choices to be shown in the game.
     * @throws {PixiError} when a choice contains functions or class instances that cannot be serialized to JSON.
     */
    set list(data: StoredChoiceInterface[] | undefined);
    /**
     * Select a choice from the choice menu, and close the choice menu.
     * @param item The choice item selected by the player.
     * @param props The props to pass to the label.
     * @returns StepLabelResultType or undefined.
     * @throws {PixiError} when the choice type is not `"call"`, `"jump"`, or `"close"`.
     * @example
     * ```ts
     * narration.choices.select(item, {
     *     navigate: navigate,
     *     // your props
     *     ...item.props
     * })
     *     .then(() => {
     *         // your code
     *     })
     *     .catch((e) => {
     *         // your code
     *     })
     * ```
     */
    select<T extends {}>(
        item: StoredIndexedChoiceInterface,
        props: StepLabelPropsType<T>,
    ): Promise<StepLabelResultType>;
}
