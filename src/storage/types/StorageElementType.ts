type StorageElementPrimaryType =
    | string
    | number
    | boolean
    | undefined
    | null
    | StorageElementPrimaryType[];
type StorageElementInternalType =
    | StorageElementPrimaryType
    | Record<string | number | symbol, StorageElementPrimaryType>
    | StorageElementInternalType[];

type NonFunctionStorage =
    | string
    | number
    | boolean
    | undefined
    | null
    | NonFunctionStorage[]
    | { [key: string | number | symbol]: NonFunctionStorage };

/**
 * StorageElementType are all the types that can be stored in the storage
 */
export type StorageElementType =
    | StorageElementInternalType
    | Record<string | number | symbol, StorageElementInternalType>
    | { [key: string | number | symbol]: StorageElementType }
    | StorageObjectType[]
    | (StorageElementPrimaryType | StorageElementInternalType | StorageElementType)[]
    | { [key: string | number | symbol]: NonFunctionStorage };
/**
 * StorageObjectType are all the types that can be stored in the storage
 */
export type StorageObjectType = Record<string | number | symbol, StorageElementType>;
