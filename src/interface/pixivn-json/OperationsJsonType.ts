import { SetFlagStorageJsonType, SetStorageJsonType } from "./StorageJsonType"

type OperationsJsonType = (
    SetStorageJsonType | SetFlagStorageJsonType
)[]

export default OperationsJsonType
