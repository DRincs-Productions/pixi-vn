type StorageElementPrimaryType = string | number | boolean | undefined | null | StorageElementInternalType[]
type StorageElementInternalType = StorageElementPrimaryType | Record<string | number | symbol, StorageElementPrimaryType>

/**
 * StorageElementType are all the types that can be stored in the storage
 */
export type StorageElementType = StorageElementInternalType | InstanceType<new (...args: any) => any>