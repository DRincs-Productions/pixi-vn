import NarrationManager from './NarrationManager';
import SoundManager from './SoundManager';
import StorageManager from './StorageManager';

export {
    /**
     *  @deprecated use "import { narration } from '@drincs/pixi-vn';"
     */
    default as GameWindowManager,
    default as canvas
} from './CanvasManager';
export {
    /**
     *  @deprecated use "import { canvas } from '@drincs/pixi-vn';"
     */
    default as GameStepManager
} from './NarrationManager';
export {
    /**
     *  @deprecated use "import { storage } from '@drincs/pixi-vn';"
     */
    default as GameStorageManager
} from './StorageManager';

const sound = new SoundManager()
const narration = new NarrationManager()
const storage = new StorageManager()

export { narration, sound, storage };

