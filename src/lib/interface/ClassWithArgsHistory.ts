import { StorageElementType } from "../types/StorageElementType";

/**
 * ClassWithArgsHistory is a class that contains the name of a class and the arguments that were used to create it.
 */
export interface ClassWithArgsHistory {
    className: string,
    args: { [tag: string]: StorageElementType }
}
