import { StorageElementType } from "../types/StorageElementType";

/**
 * IClassWithArgsHistory is a class that contains the name of a class and the arguments that were used to create it.
 */
export interface IClassWithArgsHistory {
    className: string,
    args: { [tag: string]: StorageElementType }
}
