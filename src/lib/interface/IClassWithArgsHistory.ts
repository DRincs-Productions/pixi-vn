import { StorageElementType } from "../types/StorageElementType";
import { TickerTagType } from "../types/TickerTagType";

/**
 * IClassWithArgsHistory is a class that contains the name of a class and the arguments that were used to create it.
 */
export interface IClassWithArgsHistory {
    id: string,
    fn: (dt: number) => void | undefined,
    className: TickerTagType,
    args: { [tag: string]: StorageElementType }
    elements: string[]
}
