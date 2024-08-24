import GameSoundManager from './SoundManager';

export {
    /**
     *  @deprecated use "import { canvas } from '@drincs/pixi-vn';"
     */
    default as GameStepManager,
    default as narration
} from './NarrationManager';
export {
    /**
     *  @deprecated use "import { storage } from '@drincs/pixi-vn';"
     */
    default as GameStorageManager,
    default as storage
} from './StorageManager';
export {
    /**
     *  @deprecated use "import { narration } from '@drincs/pixi-vn';"
     */
    default as GameWindowManager,
    default as canvas
} from './WindowManager';

const sound = new GameSoundManager()

export { sound };

