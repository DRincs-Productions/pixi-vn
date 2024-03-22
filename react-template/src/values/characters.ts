import { CharacterModelBase, saveCharacter } from "@drincs/pixi-vn";

export const liam = new CharacterModelBase('liam', {
    name: 'Liam',
    surname: 'Smith',
    age: 25,
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4eMoz7DH8l_Q-iCzSc1xyu_C2iryWh2O9_FcDBpY04w&s",
    color: "#9e2e12"
});

saveCharacter(liam);
