import type { StorageElementType } from "../../storage";
import type { InputInfo } from "../types/InputInfo";

export default interface NarrationInputInterface {
    /**
     * The input value to be inserted by the player.
     */
    value: StorageElementType;
    /**
     * If true, the player must enter a value.
     */
    readonly isRequired: boolean;
    /**
     * Returns the type of input prompt requested.
     */
    readonly type: string | undefined;
    /**
     * Returns `true` if the player must enter a value.
     * @param info The input value to be inserted by the player.
     * @param defaultValue The default value to be inserted.
     */
    request(info?: Omit<InputInfo, "isRequired">, defaultValue?: StorageElementType): void;
    /**
     * Remove the input request.
     */
    removeRequest(): void;
}
