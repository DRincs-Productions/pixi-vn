import { CharacterModelBase } from "../lib/classes/CharacterModelBase";
import { saveCharacter } from "../lib/decorators/CharacterDecorator";

export const liam = new CharacterModelBase('liam', {
    name: 'Liam',
    surname: 'Smith',
    age: 25,
});

saveCharacter(liam);
