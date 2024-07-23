import { CharacterBaseModel } from "../classes";
import { saveCharacter } from "../decorators";

export const juliette = new CharacterBaseModel('___pixivn_juliette___', {
    name: 'Juliette',
    age: 25,
    icon: "https://firebasestorage.googleapis.com/v0/b/pixi-vn.appspot.com/o/public%2Fcharacters%2Fjuliette-square.webp?alt=media",
    color: "#ac0086"
});

saveCharacter(juliette);

export const eggHeadImage = "https://pixijs.com/assets/eggHead.png"
export const eggHeadName = `<span style="color:purple">Egg Head</span>`
export const flowerTopImage = "https://pixijs.com/assets/flowerTop.png"
export const flowerTopName = `<span style="color:green">Flower Top</span>`
export const helmlokImage = "https://pixijs.com/assets/helmlok.png"
export const helmlokName = `<span style="color:blue">Helmlok</span>`
export const skullyImage = "https://pixijs.com/assets/skully.png"
export const skullyName = `<span style="color:red">Skully</span>`
export const bunnyImage = "https://pixijs.com/assets/bunny.png"
export const bunnyName = `Bunny`
