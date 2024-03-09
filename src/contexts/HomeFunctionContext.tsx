import { createContext } from "react"

export class HomeFunctionContextModel {
    constructor(updateAccountEvent: (clearAll?: boolean) => void, isLogged: boolean) {
        this.updateAccountEvent = updateAccountEvent
        this.isLogged = isLogged
    }
    updateAccountEvent: (clearAll?: boolean) => void
    isLogged: boolean
}

const HomeFunctionContext = createContext<HomeFunctionContextModel>(new HomeFunctionContextModel(() => { }, false))
export default HomeFunctionContext
