import { test } from "vitest";
import { sound, storage, StorageManagerStatic } from "../src";
import GameUnifier from "../src/unifier";

test("setup", async () => {
    // storage
    GameUnifier.exportStorageData = () => storage.export();
    GameUnifier.importStorageData = (data) => storage.import(data);
    GameUnifier.getVariable = (key) => storage.getVariable(key);
    GameUnifier.setVariable = (key, value) => storage.setVariable(key, value);
    GameUnifier.removeVariable = (key) => storage.removeVariable(key);
    GameUnifier.getFlag = (key) => storage.getFlag(key);
    GameUnifier.setFlag = (name, value) => storage.setFlag(name, value);
    GameUnifier.clearOldTempVariables = (openedLabelsNumber) =>
        StorageManagerStatic.clearOldTempVariables(openedLabelsNumber);
    // sound
    GameUnifier.exportSoundData = () => sound.export();
    GameUnifier.importSoundData = (data) => sound.import(data);
});
