import { CharacterBaseModel } from "../classes";
import { saveCharacter } from "../decorators";

export const juliette: any = new CharacterBaseModel('___pixivn_juliette___', {
    name: 'Juliette',
    age: 25,
    icon: "https://firebasestorage.googleapis.com/v0/b/pixi-vn.appspot.com/o/public%2Fcharacters%2Fjuliette-square.webp?alt=media",
    color: "#ac0086"
});

saveCharacter(juliette);

export const eggHeadImage = "eggHead"
export const eggHeadName = `<span style="color:purple">Egg Head</span>`
export const flowerTopImage = "flowerTop"
export const flowerTopName = `<span style="color:green">Flower Top</span>`
export const helmlokImage = "helmlok"
export const helmlokName = `<span style="color:blue">Helmlok</span>`
export const skullyImage = "skully"
export const skullyName = `<span style="color:red">Skully</span>`
export const bunnyImage = "https://pixijs.com/assets/bunny.png"
export const bunnyName = `Bunny`
export const videoLink = "https://pixijs.com/assets/video.mp4"
export const birdAudio = "https://pixijs.io/sound/examples/resources/bird.mp3"
export const musicalAudio = "https://pixijs.io/sound/examples/resources/musical.mp3"
