import { storage } from "../managers";

/**
 * @deprecated Use {@link storage.getFlag} instead
 */
export function setFlag(name: string, value: boolean) {
    return storage.setFlag(name, value);
}

/**
 * @deprecated Use {@link storage.getFlag} instead
 */
export function getFlag(name: string): boolean {
    return storage.getFlag(name);
}
