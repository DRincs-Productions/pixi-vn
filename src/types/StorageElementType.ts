type StorageElementPrimaryType = string | number | boolean | undefined | null | StorageElementPrimaryType[]
type StorageElementInternalType = StorageElementPrimaryType | Record<string | number | symbol, StorageElementPrimaryType> | StorageElementInternalType[]

/**
 * StorageElementType are all the types that can be stored in the storage
 */
export type StorageElementType = StorageElementInternalType | Record<string | number | symbol, StorageElementInternalType>
