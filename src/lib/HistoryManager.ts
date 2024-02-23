type HystoryElement = {
    path: string,
    storage: object,
}

export class HistoryManager {
    private constructor() { }
    public history: HystoryElement[] = []
}
