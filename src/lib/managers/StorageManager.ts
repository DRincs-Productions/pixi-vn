import { ExportedStorage } from "../classes/ExportedStorage"

export class GameStorageManager {
    private static stepOidUsedList: string[] = []
    private static storage: Object = {}
    private constructor() { }
    public static getNewStepOid(): string {
        let oid = ""
        do {
            oid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        } while (GameStorageManager.stepOidUsedList.includes(oid))
        GameStorageManager.stepOidUsedList.push(oid)
        return oid
    }
    public static clear() {
        GameStorageManager.stepOidUsedList = []
        GameStorageManager.storage = {}
    }
    public static export(): ExportedStorage {
        return {
            storage: GameStorageManager.storage,
            stepOidUsedList: GameStorageManager.stepOidUsedList
        }
    }
    public static import(data: object) {
        GameStorageManager.clear()
        try {
            if (data.hasOwnProperty("storage")) {
                GameStorageManager.storage = (data as ExportedStorage)["storage"] as object
            }
            else {
                console.log("No storage data found")
            }
            if (data.hasOwnProperty("stepOidUsedList")) {
                GameStorageManager.stepOidUsedList = (data as ExportedStorage)["stepOidUsedList"] as string[]
            }
            else {
                console.log("No stepOidUsed data found")
            }
        }
        catch (e) {
            console.error("Error importing data", e)
        }
    }
}
