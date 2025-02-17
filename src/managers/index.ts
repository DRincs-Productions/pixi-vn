import NarrationManagerInterface from "../interface/managers/NarrationManagerInterface";
import CanvasManager from "./CanvasManager";
import NarrationManager from "./NarrationManager";
import SoundManager from "./SoundManager";
import StorageManager from "./StorageManager";

export {
    /**
     *  @deprecated use "import { narration } from '@drincs/pixi-vn';"
     */
    default as GameWindowManager,
} from "./CanvasManager";
export {
    /**
     *  @deprecated use "import { canvas } from '@drincs/pixi-vn';"
     */
    default as GameStepManager,
} from "./NarrationManager";
export {
    /**
     *  @deprecated use "import { storage } from '@drincs/pixi-vn';"
     */
    default as GameStorageManager,
} from "./StorageManager";

export { default as CanvasManagerStatic } from "./CanvasManagerStatic";
export { default as NarrationManagerStatic } from "./NarrationManagerStatic";
export { default as SoundManagerStatic } from "./SoundManagerStatic";
export { default as StorageManagerStatic } from "./StorageManagerStatic";

const sound = new SoundManager();
const narration: NarrationManagerInterface = new NarrationManager();
const storage = new StorageManager();
const canvas = new CanvasManager();

export { canvas, narration, sound, storage };
