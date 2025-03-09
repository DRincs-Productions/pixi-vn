import SoundManager from "./SoundManager";

export { default as Sound } from "../sound/classes/Sound";
export { default as SoundManagerStatic } from "./SoundManagerStatic";
export { sound };

const sound = new SoundManager();
