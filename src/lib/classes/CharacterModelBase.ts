import { StoredClassModel } from "./StoredClassModel"

interface ICharacterModelBase {
    name: string
    surname?: string
    age?: number
    icon?: string
    color?: string | number
}

export class CharacterModelBase extends StoredClassModel implements ICharacterModelBase {
    constructor(tag: string, props: ICharacterModelBase) {
        super(tag)
        this.defaultName = props.name
        this.defaultSurname = props.surname
        this.defaultAge = props.age
        this.icon = props.icon
        this.color = props.color
    }
    private defaultName: string = ""
    get name(): string {
        return this.getStorageProperty<string>("name") || this.defaultName
    }
    set name(value: string) {
        this.updateStorage({ ...this, name: value })
    }
    private defaultSurname?: string
    get surname(): string | undefined {
        return this.getStorageProperty<string>("surname") || this.defaultSurname
    }
    set surname(value: string | undefined) {
        this.updateStorage({ ...this, surname: value })
    }
    private defaultAge?: number | undefined
    get age(): number | undefined {
        return this.getStorageProperty<number>("age") || this.defaultAge
    }
    set age(value: number | undefined) {
        this.updateStorage({ ...this, age: value })
    }
    icon?: string
    color?: string | number
}
