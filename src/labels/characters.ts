import { CharacterBaseModel } from "../classes";
import { saveCharacter } from "../decorators";

export const juliette = new CharacterBaseModel('___pixivn_juliette___', {
    name: 'Juliette',
    age: 25,
    icon: "https://firebasestorage.googleapis.com/v0/b/pixi-vn.appspot.com/o/public%2Fcharacters%2Fjuliette-square.webp?alt=media&token=5856ae7b-d99e-4563-86ec-cbc48cc9c6b4",
    color: "#ac0086"
});

saveCharacter(juliette);
